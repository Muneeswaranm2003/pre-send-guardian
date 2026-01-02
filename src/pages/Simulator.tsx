import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RiskGauge from "@/components/RiskGauge";
import IssueItem from "@/components/IssueItem";
import {
  ArrowRight,
  Send,
  Shield,
  CheckCircle,
  AlertTriangle,
  Mail,
  Server,
  Users,
  FileText,
  BarChart3,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

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
}

const Simulator = () => {
  const [emailContent, setEmailContent] = useState("");
  const [domain, setDomain] = useState("");
  const [volume, setVolume] = useState([1000]);
  const [domainAge, setDomainAge] = useState("new");
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const simulateRisk = () => {
    if (!emailContent.trim()) {
      toast.error("Please enter your email content");
      return;
    }
    if (!domain.trim()) {
      toast.error("Please enter your sending domain");
      return;
    }

    setIsSimulating(true);
    toast.info("Analyzing your email campaign...");

    // Simulate API call
    setTimeout(() => {
      // Calculate mock risk based on inputs
      let baseRisk = 25;

      // Domain age factor
      if (domainAge === "new") baseRisk += 25;
      else if (domainAge === "month") baseRisk += 15;
      else if (domainAge === "quarter") baseRisk += 5;

      // Volume factor
      if (volume[0] > 5000) baseRisk += 20;
      else if (volume[0] > 2000) baseRisk += 10;

      // Content factors
      if (emailContent.toLowerCase().includes("free")) baseRisk += 5;
      if (emailContent.toLowerCase().includes("urgent")) baseRisk += 8;
      if (emailContent.toLowerCase().includes("click here")) baseRisk += 7;
      if (emailContent.includes("!!!!")) baseRisk += 10;
      if (emailContent.split("http").length > 5) baseRisk += 12;

      const riskScore = Math.min(Math.max(baseRisk, 0), 100);

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
      } else if (volume[0] > 2000) {
        issues.push({
          severity: "medium",
          message: "Sending volume is above baseline average",
          recommendation: "Consider splitting your campaign into smaller batches",
        });
      }

      if (emailContent.toLowerCase().includes("free") || emailContent.toLowerCase().includes("urgent")) {
        issues.push({
          severity: "medium",
          message: "Content contains spam trigger words",
          recommendation: "Avoid words like 'free', 'urgent', 'act now' in subject lines",
        });
      }

      if (emailContent.split("http").length > 5) {
        issues.push({
          severity: "medium",
          message: "Email contains too many links",
          recommendation: "Reduce the number of links to 3-5 maximum",
        });
      }

      if (!domain.includes(".")) {
        issues.push({
          severity: "low",
          message: "Domain format may not be valid",
          recommendation: "Ensure you're using a properly configured sending domain",
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
          reputation: domainAge === "new" ? 70 : domainAge === "month" ? 40 : 15,
          authentication: 10,
          engagement: 25,
          content: emailContent.toLowerCase().includes("free") ? 35 : 15,
          volume: volume[0] > 5000 ? 60 : volume[0] > 2000 ? 30 : 10,
        },
      });

      setIsSimulating(false);
      toast.success("Simulation complete!");
    }, 2000);
  };

  const resetSimulation = () => {
    setResult(null);
    setEmailContent("");
    setDomain("");
    setVolume([1000]);
    setDomainAge("new");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Email Spam Risk Simulator
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Analyze your email campaign before sending. Get instant risk scoring 
              and actionable recommendations to maximize deliverability.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Email Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="text">
                    <TabsList className="mb-4">
                      <TabsTrigger value="text">Plain Text</TabsTrigger>
                      <TabsTrigger value="html">HTML</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text">
                      <Textarea
                        placeholder="Paste your email content here..."
                        className="min-h-[200px] resize-none"
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="html">
                      <Textarea
                        placeholder="Paste your HTML email template here..."
                        className="min-h-[200px] resize-none font-mono text-sm"
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" />
                    Sending Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="domain">Sending Domain</Label>
                      <Input
                        id="domain"
                        placeholder="e.g., mail.yourdomain.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domainAge">Domain Age</Label>
                      <Select value={domainAge} onValueChange={setDomainAge}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select domain age" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Less than 2 weeks</SelectItem>
                          <SelectItem value="month">2 weeks - 1 month</SelectItem>
                          <SelectItem value="quarter">1 - 3 months</SelectItem>
                          <SelectItem value="established">3+ months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Planned Send Volume</Label>
                      <span className="text-sm font-medium text-primary">
                        {volume[0].toLocaleString()} emails
                      </span>
                    </div>
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={10000}
                      min={100}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>100</span>
                      <span>10,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={simulateRisk}
                disabled={isSimulating}
              >
                {isSimulating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Simulate Risk
                  </>
                )}
              </Button>
            </div>

            {/* Results Panel */}
            <div className="space-y-6">
              {result ? (
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Risk Breakdown
                      </CardTitle>
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

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={resetSimulation}
                  >
                    Start New Simulation
                  </Button>
                </>
              ) : (
                <Card className="h-full min-h-[500px] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
                      <Shield className="w-10 h-10 text-accent-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Ready to Simulate
                    </h3>
                    <p className="text-muted-foreground max-w-sm">
                      Fill in your email content and sending configuration, 
                      then click "Simulate Risk" to see your deliverability prediction.
                    </p>
                    <div className="mt-8 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <FileText className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">Content Analysis</p>
                      </div>
                      <div className="text-center">
                        <Lock className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">Auth Check</p>
                      </div>
                      <div className="text-center">
                        <Users className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">Volume Risk</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Simulator;
