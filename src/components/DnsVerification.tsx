import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Key,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DnsVerificationResult {
  spf: {
    found: boolean;
    valid: boolean;
    record: string | null;
    issues: string[];
    recommendations: string[];
  };
  dkim: {
    found: boolean;
    valid: boolean;
    selector: string;
    record: string | null;
    issues: string[];
    recommendations: string[];
  };
  dmarc: {
    found: boolean;
    valid: boolean;
    record: string | null;
    policy: string | null;
    issues: string[];
    recommendations: string[];
  };
  overallScore: number;
  overallStatus: "pass" | "warning" | "fail";
}

interface DnsVerificationProps {
  domain: string;
  onDomainChange: (domain: string) => void;
  onVerificationComplete?: (result: DnsVerificationResult) => void;
}

const DnsVerification = ({ domain, onDomainChange, onVerificationComplete }: DnsVerificationProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [dkimSelector, setDkimSelector] = useState("google");
  const [result, setResult] = useState<DnsVerificationResult | null>(null);

  const verifyDns = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain to verify");
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("verify-dns", {
        body: { domain, dkimSelector },
      });

      if (error) {
        throw error;
      }

      setResult(data);
      onVerificationComplete?.(data);

      if (data.overallStatus === "pass") {
        toast.success("DNS authentication looks good!");
      } else if (data.overallStatus === "warning") {
        toast.warning("Some DNS issues found - check recommendations");
      } else {
        toast.error("DNS authentication needs attention");
      }
    } catch (error) {
      console.error("DNS verification error:", error);
      toast.error("Failed to verify DNS records. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = (found: boolean, valid: boolean) => {
    if (!found) return <XCircle className="w-5 h-5 text-destructive" />;
    if (!valid) return <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning))]" />;
    return <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />;
  };

  const getStatusColor = (found: boolean, valid: boolean) => {
    if (!found) return "border-destructive/30 bg-destructive/5";
    if (!valid) return "border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5";
    return "border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          DNS Authentication Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="verify-domain">Domain to Verify</Label>
            <Input
              id="verify-domain"
              placeholder="yourdomain.com"
              value={domain}
              onChange={(e) => onDomainChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dkim-selector">DKIM Selector</Label>
            <Select value={dkimSelector} onValueChange={setDkimSelector}>
              <SelectTrigger>
                <SelectValue placeholder="Select DKIM selector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">google (Google Workspace)</SelectItem>
                <SelectItem value="selector1">selector1 (Microsoft 365)</SelectItem>
                <SelectItem value="selector2">selector2 (Microsoft 365)</SelectItem>
                <SelectItem value="default">default</SelectItem>
                <SelectItem value="k1">k1 (Mailchimp)</SelectItem>
                <SelectItem value="s1">s1 (SendGrid)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={verifyDns}
          disabled={isVerifying || !domain.trim()}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking DNS Records...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Verify DNS Authentication
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4 mt-6">
            {/* Overall Score */}
            <div className={`p-4 rounded-lg border ${
              result.overallStatus === "pass"
                ? "border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5"
                : result.overallStatus === "warning"
                ? "border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5"
                : "border-destructive/30 bg-destructive/5"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.overallStatus === "pass" ? (
                    <CheckCircle className="w-6 h-6 text-[hsl(var(--success))]" />
                  ) : result.overallStatus === "warning" ? (
                    <AlertTriangle className="w-6 h-6 text-[hsl(var(--warning))]" />
                  ) : (
                    <XCircle className="w-6 h-6 text-destructive" />
                  )}
                  <span className="font-semibold text-foreground">
                    Authentication Score
                  </span>
                </div>
                <span className={`text-2xl font-bold ${
                  result.overallStatus === "pass"
                    ? "text-[hsl(var(--success))]"
                    : result.overallStatus === "warning"
                    ? "text-[hsl(var(--warning))]"
                    : "text-destructive"
                }`}>
                  {result.overallScore}%
                </span>
              </div>
            </div>

            {/* SPF */}
            <div className={`p-4 rounded-lg border ${getStatusColor(result.spf.found, result.spf.valid)}`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(result.spf.found, result.spf.valid)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">SPF Record</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      result.spf.valid
                        ? "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]"
                        : result.spf.found
                        ? "bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))]"
                        : "bg-destructive/20 text-destructive"
                    }`}>
                      {result.spf.valid ? "Valid" : result.spf.found ? "Issues Found" : "Not Found"}
                    </span>
                  </div>
                  {result.spf.record && (
                    <code className="text-xs bg-background/50 px-2 py-1 rounded mt-2 block overflow-x-auto">
                      {result.spf.record}
                    </code>
                  )}
                  {result.spf.issues.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.spf.issues.map((issue, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                          <span className="text-destructive">•</span> {issue}
                        </li>
                      ))}
                    </ul>
                  )}
                  {result.spf.recommendations.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.spf.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                          <span className="text-primary">💡</span> {rec}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* DKIM */}
            <div className={`p-4 rounded-lg border ${getStatusColor(result.dkim.found, result.dkim.valid)}`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(result.dkim.found, result.dkim.valid)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">DKIM Record</h4>
                    <span className="text-xs text-muted-foreground">
                      (selector: {result.dkim.selector})
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      result.dkim.valid
                        ? "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]"
                        : result.dkim.found
                        ? "bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))]"
                        : "bg-destructive/20 text-destructive"
                    }`}>
                      {result.dkim.valid ? "Valid" : result.dkim.found ? "Issues Found" : "Not Found"}
                    </span>
                  </div>
                  {result.dkim.record && (
                    <code className="text-xs bg-background/50 px-2 py-1 rounded mt-2 block overflow-x-auto">
                      {result.dkim.record}
                    </code>
                  )}
                  {result.dkim.issues.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.dkim.issues.map((issue, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                          <span className="text-destructive">•</span> {issue}
                        </li>
                      ))}
                    </ul>
                  )}
                  {result.dkim.recommendations.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.dkim.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                          <span className="text-primary">💡</span> {rec}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* DMARC */}
            <div className={`p-4 rounded-lg border ${getStatusColor(result.dmarc.found, result.dmarc.valid)}`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(result.dmarc.found, result.dmarc.valid)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">DMARC Record</h4>
                    {result.dmarc.policy && (
                      <span className="text-xs text-muted-foreground">
                        (policy: {result.dmarc.policy})
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      result.dmarc.valid
                        ? "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]"
                        : result.dmarc.found
                        ? "bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))]"
                        : "bg-destructive/20 text-destructive"
                    }`}>
                      {result.dmarc.valid ? "Valid" : result.dmarc.found ? "Issues Found" : "Not Found"}
                    </span>
                  </div>
                  {result.dmarc.record && (
                    <code className="text-xs bg-background/50 px-2 py-1 rounded mt-2 block overflow-x-auto">
                      {result.dmarc.record}
                    </code>
                  )}
                  {result.dmarc.issues.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.dmarc.issues.map((issue, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                          <span className="text-destructive">•</span> {issue}
                        </li>
                      ))}
                    </ul>
                  )}
                  {result.dmarc.recommendations.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.dmarc.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                          <span className="text-primary">💡</span> {rec}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DnsVerification;
