import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
          <div className="text-center py-4 text-muted-foreground text-sm">Loading…</div>
        ) : activePlans.length === 0 ? (
          <div className="text-center py-6">
            <Flame className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">No active warmup plans</p>
            <Button size="sm" onClick={() => navigate("/warmup")}>
              <Plus className="w-4 h-4 mr-1" /> Create Plan
            </Button>
          </div>
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
