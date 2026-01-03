import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  ArrowLeft, 
  Send, 
  Globe, 
  Server, 
  Mail,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Bell
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RiskGauge from "@/components/RiskGauge";
import IssueItem from "@/components/IssueItem";

interface DkimSelectorResult {
  selector: string;
  found: boolean;
  valid: boolean;
  record: string | null;
  issues: string[];
}

interface DnsResult {
  overallScore: number;
  overallStatus: "pass" | "warning" | "fail";
  spf: { found: boolean; valid: boolean };
  dkim: { 
    found: boolean; 
    valid: boolean;
    selectors?: DkimSelectorResult[];
    validSelectorsCount?: number;
    totalSelectorsChecked?: number;
  };
  dmarc: { found: boolean; valid: boolean };
}

interface BlacklistResult {
  provider: string;
  isListed: boolean;
  checkType: string;
  returnCode?: string;
  codeInfo?: {
    type: string;
    severity: string;
    description: string;
  };
}

interface ReputationFactor {
  name: string;
  status: "clean" | "listed";
  impact: number;
  description: string;
}

interface DomainReputation {
  score: number;
  grade: string;
  factors: ReputationFactor[];
  example: {
    provider: string;
    description: string;
    howToCheck: string;
    delistingUrl: string;
  };
}

interface SimulationResult {
  riskScore: number;
  inboxProbability: number;
  issues: {
    severity: "high" | "medium" | "low";
    message: string;
    recommendation: string;
  }[];
  breakdown: {
    reputation: number;
    authentication: number;
    engagement: number;
    content: number;
    volume: number;
  };
  dnsResult?: DnsResult;
  blacklistResults?: BlacklistResult[];
  domainReputation?: DomainReputation;
}

interface StepVerifyProps {
  domain: string;
  domainAge: string;
  dkimSelector: string;
  ipAddress: string;
  smtpHost: string;
  smtpPort: number;
  volume: number[];
  subject: string;
  emailContent: string;
  onBack: () => void;
  onSaveToMonitoring?: (alertEmail: string) => Promise<void>;
}

const StepVerify = ({
  domain,
  domainAge,
  dkimSelector,
  ipAddress,
  smtpHost,
  smtpPort,
  volume,
  subject,
  emailContent,
  onBack,
  onSaveToMonitoring,
}: StepVerifyProps) => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [dnsResult, setDnsResult] = useState<DnsResult | null>(null);
  const [blacklistResults, setBlacklistResults] = useState<BlacklistResult[]>([]);
  const [domainReputation, setDomainReputation] = useState<DomainReputation | null>(null);
  const [alertEmail, setAlertEmail] = useState("");
  const [savedToMonitoring, setSavedToMonitoring] = useState(false);

  const runFullVerification = async () => {
    setIsVerifying(true);
    setResult(null);
    toast.info("Running comprehensive verification...");

    try {
      // Step 1: Verify DNS
      const { data: dnsData, error: dnsError } = await supabase.functions.invoke("verify-dns", {
        body: { domain, dkimSelector },
      });

      if (dnsError) throw dnsError;
      setDnsResult(dnsData);

      // Step 2: Check blacklists and domain reputation
      let blacklists: BlacklistResult[] = [];
      let reputation: DomainReputation | null = null;
      
      const { data: blacklistData, error: blacklistError } = await supabase.functions.invoke("check-blacklist", {
        body: { ip: ipAddress || undefined, domain },
      });

      if (!blacklistError && blacklistData) {
        blacklists = blacklistData.results || [];
        setBlacklistResults(blacklists);
        
        if (blacklistData.reputation) {
          reputation = blacklistData.reputation;
          setDomainReputation(reputation);
        }
      }

      // Step 3: Calculate risk score
      let baseRisk = 25;

      // Domain age factor
      if (domainAge === "new") baseRisk += 25;
      else if (domainAge === "month") baseRisk += 15;
      else if (domainAge === "quarter") baseRisk += 5;

      // Volume factor
      if (volume[0] > 5000) baseRisk += 20;
      else if (volume[0] > 2000) baseRisk += 10;

      // Content factors
      const content = (subject + " " + emailContent).toLowerCase();
      if (content.includes("free")) baseRisk += 5;
      if (content.includes("urgent")) baseRisk += 8;
      if (content.includes("click here")) baseRisk += 7;
      if (content.includes("!!!!")) baseRisk += 10;
      if ((emailContent.match(/http/gi) || []).length > 5) baseRisk += 12;

      // DNS factors
      let authRisk = 50;
      if (dnsData) {
        authRisk = 100 - dnsData.overallScore;
      }

      // Blacklist factors
      const listedCount = blacklists.filter((b) => b.isListed).length;
      if (listedCount > 0) baseRisk += listedCount * 15;

      const riskScore = Math.min(Math.max(baseRisk, 0), 100);

      // Build issues list
      const issues: SimulationResult["issues"] = [];

      if (domainAge === "new") {
        issues.push({
          severity: "high",
          message: "Domain age is less than 2 weeks",
          recommendation: "Warm up your domain gradually before sending large campaigns",
        });
      }

      if (volume[0] > 5000) {
        issues.push({
          severity: "high",
          message: `Sending volume (${volume[0].toLocaleString()}) is significantly above recommended`,
          recommendation: "Start with smaller batches and gradually increase volume",
        });
      }

      if (listedCount > 0) {
        issues.push({
          severity: "high",
          message: `IP/Domain listed on ${listedCount} blacklist(s)`,
          recommendation: "Request delisting from blacklist providers immediately",
        });
      }

      if (dnsData?.overallStatus !== "pass") {
        issues.push({
          severity: dnsData?.overallStatus === "warning" ? "medium" : "high",
          message: "DNS authentication issues detected",
          recommendation: "Review and fix SPF, DKIM, and DMARC records",
        });
      }

      if (content.includes("free") || content.includes("urgent")) {
        issues.push({
          severity: "medium",
          message: "Content contains spam trigger words",
          recommendation: "Avoid words like 'free', 'urgent', 'act now' in subject lines",
        });
      }

      if (issues.length === 0) {
        issues.push({
          severity: "low",
          message: "No major issues detected",
          recommendation: "Your campaign looks good! Consider A/B testing for better results",
        });
      }

      setResult({
        riskScore,
        inboxProbability: 100 - riskScore,
        issues,
        breakdown: {
          reputation: reputation ? 100 - reputation.score : (domainAge === "new" ? 70 : domainAge === "month" ? 40 : 15),
          authentication: authRisk,
          engagement: 25,
          content: content.includes("free") ? 35 : 15,
          volume: volume[0] > 5000 ? 60 : volume[0] > 2000 ? 30 : 10,
        },
        dnsResult: dnsData,
        blacklistResults: blacklists,
        domainReputation: reputation || undefined,
      });

      toast.success("Verification complete!");
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = (status: boolean | undefined, label: string) => {
    if (status === undefined) return null;
    return (
      <Badge variant={status ? "default" : "destructive"} className="gap-1">
        {status ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {label}
      </Badge>
    );
  };

  const handleSaveAndMonitor = async () => {
    if (!onSaveToMonitoring) return;
    setIsSaving(true);
    try {
      await onSaveToMonitoring(alertEmail);
      setSavedToMonitoring(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Step 4: Verify & Simulate
          </CardTitle>
          <CardDescription>
            Review your configuration and run a comprehensive deliverability check
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg bg-accent/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Domain</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{domain}</p>
              <p className="text-xs text-muted-foreground mt-1">Age: {domainAge}</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Server</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{ipAddress || "Not set"}</p>
              <p className="text-xs text-muted-foreground mt-1">Port: {smtpPort}</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Campaign</span>
              </div>
              <p className="text-sm text-muted-foreground">{volume[0].toLocaleString()} emails</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                Subject: {subject || "Not set"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              variant="hero"
              onClick={runFullVerification}
              disabled={isVerifying}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Run Full Verification
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <RiskGauge riskScore={result.riskScore} size="lg" />
                <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-xs">
                  <div className="text-center p-3 rounded-lg bg-destructive/10">
                    <div className="text-2xl font-bold text-destructive">
                      {result.riskScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">Spam Risk</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[hsl(var(--success))]/10">
                    <div className="text-2xl font-bold text-[hsl(var(--success))]">
                      {result.inboxProbability}%
                    </div>
                    <div className="text-xs text-muted-foreground">Inbox Chance</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DNS Results */}
          {dnsResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">DNS Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(dnsResult.spf?.valid, "SPF")}
                  {getStatusBadge(dnsResult.dkim?.valid, "DKIM")}
                  {getStatusBadge(dnsResult.dmarc?.valid, "DMARC")}
                </div>

                {/* DKIM Selector Details */}
                {dnsResult.dkim?.selectors && dnsResult.dkim.selectors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">
                      DKIM Selectors ({dnsResult.dkim.validSelectorsCount}/{dnsResult.dkim.totalSelectorsChecked} valid)
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {dnsResult.dkim.selectors.map((sel) => (
                        <div
                          key={sel.selector}
                          className={`p-2 rounded-lg border flex items-center gap-2 ${
                            sel.valid
                              ? "border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5"
                              : sel.found
                              ? "border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5"
                              : "border-muted bg-muted/30"
                          }`}
                        >
                          {sel.valid ? (
                            <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
                          ) : sel.found ? (
                            <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))]" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground">{sel.selector}</span>
                            {!sel.found && (
                              <span className="text-xs text-muted-foreground ml-1">(not found)</span>
                            )}
                            {sel.found && !sel.valid && sel.issues.length > 0 && (
                              <p className="text-xs text-[hsl(var(--warning))] truncate">
                                {sel.issues[0]}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Overall Score:</span>
                  <span className={`font-bold ${
                    dnsResult.overallStatus === "pass" 
                      ? "text-[hsl(var(--success))]" 
                      : dnsResult.overallStatus === "warning"
                      ? "text-[hsl(var(--warning))]"
                      : "text-destructive"
                  }`}>
                    {dnsResult.overallScore}%
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Domain Reputation Score */}
          {domainReputation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-primary" />
                  Domain Reputation Score
                </CardTitle>
                <CardDescription>
                  Based on major blacklist providers including Spamhaus DBL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score Display */}
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${
                    domainReputation.grade === "A" ? "border-[hsl(var(--success))] text-[hsl(var(--success))] bg-[hsl(var(--success))]/10" :
                    domainReputation.grade === "B" ? "border-[hsl(var(--success))]/70 text-[hsl(var(--success))] bg-[hsl(var(--success))]/5" :
                    domainReputation.grade === "C" ? "border-[hsl(var(--warning))] text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10" :
                    domainReputation.grade === "D" ? "border-[hsl(var(--warning))]/70 text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/5" :
                    "border-destructive text-destructive bg-destructive/10"
                  }`}>
                    {domainReputation.grade}
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">{domainReputation.score}/100</div>
                    <div className="text-sm text-muted-foreground">
                      {domainReputation.score >= 90 ? "Excellent reputation" :
                       domainReputation.score >= 80 ? "Good reputation" :
                       domainReputation.score >= 70 ? "Fair reputation" :
                       domainReputation.score >= 50 ? "Poor reputation" :
                       "Critical - needs immediate attention"}
                    </div>
                  </div>
                </div>

                {/* Reputation Factors */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Reputation Factors</h4>
                  <div className="grid gap-2">
                    {domainReputation.factors.map((factor, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${
                          factor.status === "clean"
                            ? "border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5"
                            : "border-destructive/30 bg-destructive/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {factor.status === "clean" ? (
                            <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                          <span className="font-medium text-foreground">{factor.name}</span>
                          {factor.impact !== 0 && (
                            <Badge variant="destructive" className="ml-auto">
                              {factor.impact} pts
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spamhaus Example */}
                <div className="p-4 rounded-lg border border-border bg-accent/30">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">
                        Example: {domainReputation.example.provider}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {domainReputation.example.description}
                      </p>
                      <div className="text-xs space-y-1">
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">DNS Query:</span>{" "}
                          <code className="bg-muted px-1 py-0.5 rounded">{domainReputation.example.howToCheck}</code>
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Delisting:</span>{" "}
                          <a 
                            href={domainReputation.example.delistingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {domainReputation.example.delistingUrl}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blacklist Results */}
          {blacklistResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Blacklist Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {blacklistResults.map((bl, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        bl.isListed
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {bl.isListed ? (
                          <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-foreground">{bl.provider}</span>
                      </div>
                      {bl.isListed && bl.codeInfo && (
                        <div className="mt-2 pl-6 space-y-1">
                          <Badge 
                            variant="destructive" 
                            className={`text-xs ${
                              bl.codeInfo.severity === "critical" 
                                ? "bg-destructive" 
                                : bl.codeInfo.severity === "high"
                                ? "bg-destructive/80"
                                : "bg-[hsl(var(--warning))]"
                            }`}
                          >
                            {bl.codeInfo.type.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{bl.codeInfo.description}</p>
                          {bl.returnCode && (
                            <p className="text-xs text-muted-foreground/70">Code: {bl.returnCode}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(result.breakdown).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-foreground">{key} Risk</span>
                    <span className="font-medium text-muted-foreground">{value}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        value > 50
                          ? "bg-destructive"
                          : value > 25
                          ? "bg-[hsl(var(--warning))]"
                          : "bg-[hsl(var(--success))]"
                      }`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Issues & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.issues.map((issue, i) => (
                <IssueItem
                  key={i}
                  severity={issue.severity}
                  message={issue.message}
                  recommendation={issue.recommendation}
                />
              ))}
            </CardContent>
          </Card>

          {/* Save to Monitoring */}
          {onSaveToMonitoring && !savedToMonitoring && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="w-5 h-5 text-primary" />
                  Enable Live Monitoring
                </CardTitle>
                <CardDescription>
                  Get notified when your domain health changes or gets blacklisted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alertEmail">Alert Email Address</Label>
                  <Input
                    id="alertEmail"
                    type="email"
                    placeholder="alerts@yourdomain.com"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send you alerts when issues are detected with your domain or IP
                  </p>
                </div>
                <Button 
                  onClick={handleSaveAndMonitor} 
                  className="w-full" 
                  variant="hero"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Add to Live Monitoring
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Success - Go to Dashboard */}
          {savedToMonitoring && (
            <Card className="border-2 border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[hsl(var(--success))]/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[hsl(var(--success))]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Domain Added to Monitoring</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alertEmail ? `Alerts will be sent to ${alertEmail}` : "You can set up email alerts in the dashboard"}
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate("/dashboard")} 
                    className="w-full" 
                    variant="hero"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Go to Live Monitoring Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default StepVerify;
