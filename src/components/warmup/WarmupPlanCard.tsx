import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Flame, Pause, Play, Trash2, CheckCircle, AlertTriangle, TrendingUp, Calendar,
} from "lucide-react";
import { generateSchedule, getRecommendedVolume } from "@/hooks/useWarmupPlans";
import type { Tables } from "@/integrations/supabase/types";

type WarmupPlan = Tables<"warmup_plans">;
type WarmupDailyLog = Tables<"warmup_daily_logs">;

interface WarmupPlanCardProps {
  plan: WarmupPlan;
  logs: WarmupDailyLog[];
  onFetchLogs: (planId: string) => void;
  onUpdateStatus: (planId: string, status: "active" | "paused" | "completed") => void;
  onLogDay: (planId: string, dayNumber: number, recommendedVolume: number, actualVolume: number, bounceRate?: number, complaintRate?: number, notes?: string) => void;
  onDelete: (planId: string) => void;
}

const STATUS_CONFIG = {
  active: { label: "Active", variant: "default" as const, icon: Play },
  paused: { label: "Paused", variant: "secondary" as const, icon: Pause },
  completed: { label: "Completed", variant: "outline" as const, icon: CheckCircle },
};

export default function WarmupPlanCard({
  plan, logs, onFetchLogs, onUpdateStatus, onLogDay, onDelete,
}: WarmupPlanCardProps) {
  const [actualVolume, setActualVolume] = useState("");
  const [bounceRate, setBounceRate] = useState("");
  const [complaintRate, setComplaintRate] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    onFetchLogs(plan.id);
  }, [plan.id, onFetchLogs]);

  const schedule = generateSchedule(plan.domain_age, plan.target_daily_volume);
  const totalDays = schedule.length;
  const completedDays = logs.filter((l) => l.status === "completed" || l.status === "issue").length;
  const progressPercent = Math.round((completedDays / totalDays) * 100);
  const currentDayVolume = getRecommendedVolume(plan.domain_age, plan.current_day, plan.target_daily_volume);

  const todayLogged = logs.some((l) => l.day_number === plan.current_day);
  const hasIssues = logs.some((l) => l.status === "issue");

  const statusConfig = STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
  const StatusIcon = statusConfig.icon;

  const handleLogDay = () => {
    const vol = parseInt(actualVolume) || currentDayVolume;
    const br = bounceRate ? parseFloat(bounceRate) : undefined;
    const cr = complaintRate ? parseFloat(complaintRate) : undefined;
    onLogDay(plan.id, plan.current_day, currentDayVolume, vol, br, cr);
    setActualVolume("");
    setBounceRate("");
    setComplaintRate("");
  };

  return (
    <Card className={hasIssues ? "border-destructive/30" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />
              {plan.domain}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Started {new Date(plan.started_at).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={statusConfig.variant} className="gap-1">
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Day {plan.current_day} of {totalDays}</span>
            <span className="font-medium text-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Today's target */}
        {plan.status === "active" && !todayLogged && (
          <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Today's Target</span>
              </div>
              <span className="text-lg font-bold text-primary">
                {currentDayVolume.toLocaleString()} emails
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Actual Volume</Label>
                <Input
                  type="number"
                  placeholder={currentDayVolume.toString()}
                  value={actualVolume}
                  onChange={(e) => setActualVolume(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bounce Rate %</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0.5"
                  value={bounceRate}
                  onChange={(e) => setBounceRate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Complaint Rate %</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.05"
                  value={complaintRate}
                  onChange={(e) => setComplaintRate(e.target.value)}
                />
              </div>
            </div>

            <Button size="sm" onClick={handleLogDay} className="w-full">
              <CheckCircle className="w-4 h-4 mr-2" />
              Log Day {plan.current_day}
            </Button>
          </div>
        )}

        {todayLogged && plan.status === "active" && (
          <div className="p-3 rounded-lg bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/30 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
            <span className="text-sm text-foreground">Day {plan.current_day} logged! Come back tomorrow.</span>
          </div>
        )}

        {/* Log history toggle */}
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="w-full">
          <Calendar className="w-4 h-4 mr-2" />
          {expanded ? "Hide" : "Show"} Log History ({completedDays} days)
        </Button>

        {expanded && logs.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`flex items-center justify-between text-xs p-2 rounded ${
                  log.status === "issue"
                    ? "bg-destructive/10 border border-destructive/20"
                    : "bg-accent/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {log.status === "issue" ? (
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-[hsl(var(--success))]" />
                  )}
                  <span className="text-muted-foreground">Day {log.day_number}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-foreground font-medium">
                    {log.actual_volume?.toLocaleString() ?? "—"} / {log.recommended_volume.toLocaleString()}
                  </span>
                  {log.bounce_rate != null && (
                    <span className={log.bounce_rate > 2 ? "text-destructive" : "text-muted-foreground"}>
                      BR: {log.bounce_rate}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          {plan.status === "active" ? (
            <Button variant="outline" size="sm" onClick={() => onUpdateStatus(plan.id, "paused")} className="flex-1">
              <Pause className="w-3 h-3 mr-1" /> Pause
            </Button>
          ) : plan.status === "paused" ? (
            <Button variant="outline" size="sm" onClick={() => onUpdateStatus(plan.id, "active")} className="flex-1">
              <Play className="w-3 h-3 mr-1" /> Resume
            </Button>
          ) : null}
          {plan.status !== "completed" && (
            <Button variant="outline" size="sm" onClick={() => onUpdateStatus(plan.id, "completed")} className="flex-1">
              <CheckCircle className="w-3 h-3 mr-1" /> Complete
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onDelete(plan.id)}>
            <Trash2 className="w-3 h-3 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
