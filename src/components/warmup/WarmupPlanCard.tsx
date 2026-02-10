import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Flame, Pause, Play, Trash2, CheckCircle, AlertTriangle, Calendar, ChevronDown, ChevronUp,
} from "lucide-react";
import { generateSchedule, getRecommendedVolume } from "@/hooks/useWarmupPlans";
import WarmupProgressChart from "./WarmupProgressChart";
import WarmupBounceChart from "./WarmupBounceChart";
import WarmupMilestones from "./WarmupMilestones";
import WarmupLogForm from "./WarmupLogForm";
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
  const recentIssues = logs.filter((l) => l.status === "issue").slice(-3);

  const statusConfig = STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
  const StatusIcon = statusConfig.icon;

  const handleLogDay = (actualVolume: number, bounceRate?: number, complaintRate?: number, notes?: string) => {
    onLogDay(plan.id, plan.current_day, currentDayVolume, actualVolume, bounceRate, complaintRate, notes);
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Started {new Date(plan.started_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>Target: {plan.target_daily_volume.toLocaleString()}/day</span>
            </div>
          </div>
          <Badge variant={statusConfig.variant} className="gap-1">
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Day {plan.current_day} of {totalDays}</span>
            <span className="font-medium text-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Smart alerts */}
        {recentIssues.length > 0 && plan.status === "active" && (
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm space-y-1">
            <div className="flex items-center gap-2 font-medium text-destructive">
              <AlertTriangle className="w-4 h-4" />
              {recentIssues.length} recent issue{recentIssues.length > 1 ? "s" : ""} detected
            </div>
            <p className="text-xs text-muted-foreground">
              High bounce rates slow your reputation. Consider reducing volume or pausing.
            </p>
          </div>
        )}

        {/* Log form for today */}
        {plan.status === "active" && !todayLogged && (
          <WarmupLogForm
            currentDay={plan.current_day}
            recommendedVolume={currentDayVolume}
            onLog={handleLogDay}
          />
        )}

        {todayLogged && plan.status === "active" && (
          <div className="p-3 rounded-lg bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/30 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
            <span className="text-sm text-foreground">Day {plan.current_day} logged! Come back tomorrow.</span>
          </div>
        )}

        {/* Expand/collapse analytics */}
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="w-full">
          {expanded ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
          {expanded ? "Hide" : "Show"} Analytics & History
        </Button>

        {expanded && (
          <div className="space-y-4">
            <WarmupProgressChart
              domainAge={plan.domain_age}
              targetVolume={plan.target_daily_volume}
              logs={logs}
              currentDay={plan.current_day}
            />
            <WarmupBounceChart logs={logs} />
            <WarmupMilestones plan={plan} logs={logs} />

            {/* Log history */}
            {logs.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Daily Log ({completedDays} days)
                </p>
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
                        {log.notes && (
                          <span className="text-muted-foreground italic truncate max-w-[120px]">— {log.notes}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-foreground font-medium">
                          {log.actual_volume?.toLocaleString() ?? "—"} / {log.recommended_volume.toLocaleString()}
                        </span>
                        {log.bounce_rate != null && (
                          <span className={Number(log.bounce_rate) > 2 ? "text-destructive" : "text-muted-foreground"}>
                            BR: {String(log.bounce_rate)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
