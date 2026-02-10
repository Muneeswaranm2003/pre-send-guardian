import { Card, CardContent } from "@/components/ui/card";
import { Flame, TrendingUp, AlertTriangle, CheckCircle, Pause, BarChart3 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type WarmupPlan = Tables<"warmup_plans">;

interface Props {
  plans: WarmupPlan[];
}

export default function WarmupStatsCards({ plans }: Props) {
  const active = plans.filter((p) => p.status === "active").length;
  const paused = plans.filter((p) => p.status === "paused").length;
  const completed = plans.filter((p) => p.status === "completed").length;
  const totalDomains = plans.length;

  const avgProgress = plans.length
    ? Math.round(plans.reduce((sum, p) => sum + Math.min((p.current_day / 42) * 100, 100), 0) / plans.length)
    : 0;

  const stats = [
    { icon: Flame, value: active, label: "Active", colorClass: "bg-primary/10", iconClass: "text-primary" },
    { icon: Pause, value: paused, label: "Paused", colorClass: "bg-[hsl(var(--warning))]/10", iconClass: "text-[hsl(var(--warning))]" },
    { icon: CheckCircle, value: completed, label: "Completed", colorClass: "bg-[hsl(var(--success))]/10", iconClass: "text-[hsl(var(--success))]" },
    { icon: BarChart3, value: `${avgProgress}%`, label: "Avg Progress", colorClass: "bg-accent", iconClass: "text-accent-foreground" },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {stats.map(({ icon: Icon, value, label, colorClass, iconClass }, i) => (
        <Card key={i}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className={`w-4 h-4 ${iconClass}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
