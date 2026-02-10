import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Zap, Target, Rocket } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type WarmupPlan = Tables<"warmup_plans">;
type WarmupDailyLog = Tables<"warmup_daily_logs">;

interface Props {
  plan: WarmupPlan;
  logs: WarmupDailyLog[];
}

const MILESTONES = [
  { day: 7, label: "Week 1", icon: Star, description: "First week completed" },
  { day: 14, label: "Week 2", icon: Zap, description: "Building momentum" },
  { day: 21, label: "Week 3", icon: Target, description: "Halfway there" },
  { day: 30, label: "Month 1", icon: Rocket, description: "One month strong" },
  { day: 42, label: "Complete", icon: Trophy, description: "Warmup finished!" },
];

export default function WarmupMilestones({ plan, logs }: Props) {
  const completedDays = logs.filter((l) => l.status === "completed" || l.status === "issue").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[hsl(var(--warning))]" />
          Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {MILESTONES.map((m) => {
            const reached = completedDays >= m.day;
            const Icon = m.icon;
            return (
              <div
                key={m.day}
                className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
                  reached
                    ? "bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/20"
                    : "bg-muted/10 border border-border/50 opacity-60"
                }`}
              >
                <Icon className={`w-4 h-4 ${reached ? "text-[hsl(var(--success))]" : "text-muted-foreground"}`} />
                <div className="flex-1">
                  <span className="font-medium text-foreground">{m.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">{m.description}</span>
                </div>
                {reached ? (
                  <Badge variant="outline" className="text-xs border-[hsl(var(--success))]/30 text-[hsl(var(--success))]">
                    ✓
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Day {m.day}</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
