import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useWarmupPlans } from "@/hooks/useWarmupPlans";
import { FullPageSpinner } from "@/components/ui/loading-spinner";
import WarmupPlanCreator from "@/components/warmup/WarmupPlanCreator";
import WarmupPlanCard from "@/components/warmup/WarmupPlanCard";
import { Flame } from "lucide-react";

const Warmup = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { plans, logs, loading, fetchLogs, createPlan, updatePlanStatus, logDay, deletePlan } =
    useWarmupPlans(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) return <FullPageSpinner />;

  const activePlans = plans.filter((p) => p.status === "active");
  const otherPlans = plans.filter((p) => p.status !== "active");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Flame className="w-8 h-8 text-primary" />
              Domain Warmup Automation
            </h1>
            <p className="text-muted-foreground mt-1">
              Create personalized warmup schedules, track daily progress, and get alerts when milestones are reached.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Creator */}
            <div className="lg:col-span-1">
              <WarmupPlanCreator onCreatePlan={createPlan} />
            </div>

            {/* Plans */}
            <div className="lg:col-span-2 space-y-6">
              {activePlans.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Active Plans</h2>
                  {activePlans.map((plan) => (
                    <WarmupPlanCard
                      key={plan.id}
                      plan={plan}
                      logs={logs[plan.id] || []}
                      onFetchLogs={fetchLogs}
                      onUpdateStatus={updatePlanStatus}
                      onLogDay={logDay}
                      onDelete={deletePlan}
                    />
                  ))}
                </div>
              )}

              {otherPlans.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-muted-foreground">
                    Paused & Completed
                  </h2>
                  {otherPlans.map((plan) => (
                    <WarmupPlanCard
                      key={plan.id}
                      plan={plan}
                      logs={logs[plan.id] || []}
                      onFetchLogs={fetchLogs}
                      onUpdateStatus={updatePlanStatus}
                      onLogDay={logDay}
                      onDelete={deletePlan}
                    />
                  ))}
                </div>
              )}

              {plans.length === 0 && (
                <div className="text-center py-16 border border-dashed border-border rounded-xl">
                  <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No warmup plans yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Create your first plan to start warming up your domain safely.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Warmup;
