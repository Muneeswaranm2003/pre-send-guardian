import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { generateSchedule } from "@/hooks/useWarmupPlans";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Risk = "low" | "medium" | "high" | "critical";
interface WarmupReview {
  summary: string;
  contentRisks: string[];
  spamTriggerPhrases: string[];
  days: { day: number; risk: Risk; riskScore: number; reason: string; advice: string }[];
}

const RISK_STYLE: Record<Risk, string> = {
  low: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
  critical: "bg-destructive text-destructive-foreground border-destructive",
};

interface Props {
  plan: Tables<"warmup_plans">;
  logs: Tables<"warmup_daily_logs">[];
}

export default function WarmupAiReview({ plan, logs }: Props) {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<WarmupReview | null>(null);

  const run = async () => {
    const schedule = generateSchedule(plan.domain_age, plan.target_daily_volume);
    const start = Math.max(1, plan.current_day - 3);
    const days = schedule.slice(start - 1, start - 1 + 14).map((s) => {
      const log = logs.find((l) => l.day_number === s.day);
      return {
        day: s.day,
        volume: s.volume,
        actualVolume: log?.actual_volume ?? null,
        bounceRate: log?.bounce_rate != null ? Number(log.bounce_rate) : null,
        complaintRate: log?.complaint_rate != null ? Number(log.complaint_rate) : null,
      };
    });
    setLoading(true);
    setReview(null);
    const { data, error } = await supabase.functions.invoke("analyze-warmup", {
      body: { domain: plan.domain, domainAge: plan.domain_age, subject, body, days },
    });
    setLoading(false);
    if (error || data?.error) {
      let msg = typeof data?.error === "string" ? data.error : error?.message ?? "Review failed";
      try {
        const ctx = await (error as { context?: Response })?.context?.json?.();
        if (ctx?.error && typeof ctx.error === "string") msg = ctx.error;
      } catch { /* ignore */ }
      toast({ title: "AI Review failed", description: msg, variant: "destructive" });
      return;
    }
    setReview(data as WarmupReview);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Sparkles className="w-4 h-4 mr-2" /> AI Review warmup email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Review for {plan.domain}</DialogTitle>
          <DialogDescription>
            Paste the email you're sending during warmup to see its spam risk for each day of your schedule.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="wr-subject">Subject</Label>
            <Input id="wr-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={300} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="wr-body">Email text</Label>
            <Textarea id="wr-body" rows={6} value={body} onChange={(e) => setBody(e.target.value)} maxLength={20000} />
          </div>
          <Button onClick={run} disabled={loading || !subject.trim() || !body.trim()} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? "Reviewing (can take a minute)…" : "Generate AI Review"}
          </Button>
        </div>

        {review && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-foreground">{review.summary}</p>
            {review.contentRisks.length > 0 && (
              <ul className="text-sm list-disc pl-5 text-muted-foreground space-y-1">
                {review.contentRisks.map((r) => <li key={r}>{r}</li>)}
              </ul>
            )}
            {review.spamTriggerPhrases.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {review.spamTriggerPhrases.map((p) => (
                  <Badge key={p} variant="outline" className="border-destructive/40 text-destructive">"{p}"</Badge>
                ))}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Spam risk per day</p>
              <div className="space-y-2">
                {review.days.map((d) => (
                  <div
                    key={d.day}
                    className={`p-3 rounded-lg border ${d.day === plan.current_day ? "border-primary" : "border-border"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        Day {d.day}{d.day === plan.current_day ? " (today)" : ""}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border capitalize ${RISK_STYLE[d.risk]}`}>
                        {d.risk} · {Math.round(d.riskScore)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{d.reason}</p>
                    <p className="text-xs text-foreground mt-1"><span className="font-medium">Fix:</span> {d.advice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
