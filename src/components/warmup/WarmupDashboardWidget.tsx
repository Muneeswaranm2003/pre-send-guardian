import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Flame, ArrowRight, Plus } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type WarmupPlan = Tables<"warmup_plans">;

interface WarmupDashboardWidgetProps {
  plans: WarmupPlan[];
  loading: boolean;
}

export default function WarmupDashboardWidget({ plans, loading }: WarmupDashboardWidgetProps) {
  const navigate = useNavigate();
  const activePlans = plans.filter((p) => p.status === "active");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          Domain Warmup
        </CardTitle>
        <CardDescription>Active warmup plans</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-1.5 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : activePlans.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="No active warmup plans"
            description="Start a plan to ramp up your sending volume safely."
            compact
            action={
              <Button size="sm" onClick={() => navigate("/warmup")}>
                <Plus className="w-4 h-4 mr-1" /> Create Plan
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {activePlans.slice(0, 3).map((plan) => {
              const progress = Math.round((plan.current_day / 42) * 100);
              return (
                <div
                  key={plan.id}
                  className="p-3 rounded-lg border border-border bg-accent/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">{plan.domain}</span>
                    <Badge variant="outline" className="text-xs">Day {plan.current_day}</Badge>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    Target: {plan.target_daily_volume.toLocaleString()}/day
                  </p>
                </div>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/warmup")}
              className="w-full"
            >
              View All Plans
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
