import { AlertTriangle, CheckCircle2, Lightbulb, Quote, Shield, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface DeliverabilityAdvice {
  overallRisk: "low" | "medium" | "high" | "critical";
  riskScore: number;
  summary: string;
  inboxPlacementOutlook: string;
  risks: Array<{
    title: string;
    area: "content" | "authentication" | "reputation" | "list" | "sending";
    severity: "low" | "medium" | "high";
    why: string;
    fix: string;
  }>;
  spamTriggerPhrases: string[];
  subjectLineFeedback: string;
  quickWins: string[];
  rewrittenSubject: string;
}

const riskTone: Record<DeliverabilityAdvice["overallRisk"], string> = {
  low: "bg-success/10 text-success border-success/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  high: "bg-destructive/10 text-destructive border-destructive/30",
  critical: "bg-destructive/15 text-destructive border-destructive/40",
};

const severityTone: Record<string, string> = {
  low: "bg-success/10 text-success border-success/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  high: "bg-destructive/10 text-destructive border-destructive/30",
};

const areaLabel: Record<string, string> = {
  content: "Email content",
  authentication: "Domain setup",
  reputation: "Sender reputation",
  list: "Contact list",
  sending: "Sending habits",
};

const AdvisorResults = ({ advice }: { advice: DeliverabilityAdvice }) => {
  const score = Math.max(0, Math.min(100, Math.round(advice.riskScore)));

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Spam risk assessment</h2>
          </div>
          <Badge variant="outline" className={`capitalize ${riskTone[advice.overallRisk]}`}>
            {advice.overallRisk} risk
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Risk score</span>
            <span className="font-semibold">{score}/100</span>
          </div>
          <Progress value={score} aria-label={`Risk score ${score} out of 100`} />
        </div>
        <p className="text-sm text-muted-foreground">{advice.summary}</p>
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <span className="font-medium">Likely inbox placement: </span>
          {advice.inboxPlacementOutlook}
        </div>
      </Card>

      {advice.risks.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-semibold">What could send you to spam</h2>
          </div>
          <div className="space-y-3">
            {advice.risks.map((risk, index) => (
              <div key={`${risk.title}-${index}`} className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{risk.title}</span>
                  <Badge variant="outline" className={`capitalize ${severityTone[risk.severity]}`}>
                    {risk.severity}
                  </Badge>
                  <Badge variant="secondary">{areaLabel[risk.area] ?? risk.area}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{risk.why}</p>
                <p className="text-sm">
                  <span className="font-medium text-success">Fix: </span>
                  {risk.fix}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Subject line</h2>
          </div>
          <p className="text-sm text-muted-foreground">{advice.subjectLineFeedback}</p>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
            <span className="font-medium">Try instead: </span>
            {advice.rewrittenSubject}
          </div>
        </Card>

        <Card className="p-6 space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-semibold">Risky wording</h2>
          </div>
          {advice.spamTriggerPhrases.length === 0 ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              No obvious spam-trigger wording found.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {advice.spamTriggerPhrases.map((phrase, index) => (
                <Badge key={`${phrase}-${index}`} variant="outline" className={severityTone.medium}>
                  {phrase}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      {advice.quickWins.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-success" />
            <h2 className="text-lg font-semibold">Do these before you send</h2>
          </div>
          <ul className="space-y-2">
            {advice.quickWins.map((win, index) => (
              <li key={`${win}-${index}`} className="flex gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span>{win}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default AdvisorResults;
