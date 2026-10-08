import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, Flame, ShieldCheck, Ban, RefreshCw, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusIcon } from "@/components/ui/status-icon";
import { HealthBadge } from "@/components/ui/health-badge";
import { FullPageSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { generateSchedule } from "@/hooks/useWarmupPlans";
import type { Tables } from "@/integrations/supabase/types";

type Domain = Tables<"monitored_domains">;
type Plan = Tables<"warmup_plans">;
type Log = Tables<"warmup_daily_logs">;
type Check = Tables<"domain_check_history">;

const clean = (d: string) => d.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

const DomainHealth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [checks, setChecks] = useState<Check[]>([]);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  const load = useCallback(async () => {
    if (!user) return;
    const [d, p, l, c] = await Promise.all([
      supabase.from("monitored_domains").select("*").order("domain"),
      supabase.from("warmup_plans").select("*").order("created_at", { ascending: false }),
      supabase.from("warmup_daily_logs").select("*"),
      supabase.from("domain_check_history").select("*").order("checked_at", { ascending: false }).limit(500),
    ]);
    setDomains(d.data ?? []); setPlans(p.data ?? []); setLogs(l.data ?? []); setChecks(c.data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (authLoading || loading) return <FullPageSpinner />;

  // Include warmup-only domains too
  const names = Array.from(new Set([...domains.map((d) => clean(d.domain)), ...plans.map((p) => clean(p.domain))])).sort();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 max-w-6xl space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <PageHeader title="Domain Health" description="DNS, blacklists and warmup progress for every domain, side by side." icon={HeartPulse} />
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
        </div>

        {names.length === 0 ? (
          <EmptyState icon={Globe} title="No domains yet" description="Add a domain in the Simulator or start a warmup plan to see it here."
            action={<Button asChild><Link to="/simulator">Add a domain</Link></Button>} />
        ) : (
          <div className="space-y-4">
            {names.map((name) => {
              const dom = domains.find((d) => clean(d.domain) === name);
              const plan = plans.find((p) => clean(p.domain) === name && p.status === "active") ?? plans.find((p) => clean(p.domain) === name);
              const planLogs = plan ? logs.filter((l) => l.plan_id === plan.id) : [];
              const totalDays = plan ? generateSchedule(plan.domain_age, plan.target_daily_volume).length : 0;
              const doneDays = planLogs.filter((l) => l.status !== "pending").length;
              const issues = planLogs.filter((l) => l.status === "issue").length;
              const lastCheck = dom ? checks.find((c) => c.domain_id === dom.id) : undefined;
              const pct = totalDays ? Math.round((doneDays / totalDays) * 100) : 0;

              return (
                <Card key={name} className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <h2 className="font-semibold text-lg text-foreground flex items-center gap-2"><Globe className="w-4 h-4 text-primary" />{name}</h2>
                    {dom && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Health {dom.overall_health ?? 0}</span>
                        <HealthBadge health={dom.overall_health ?? 0} />
                      </div>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <section className="rounded-lg border border-border p-4">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4" />DNS authentication</h3>
                      {dom ? (
                        <ul className="space-y-2 text-sm">
                          {([["SPF", dom.spf_status], ["DKIM", dom.dkim_status], ["DMARC", dom.dmarc_status]] as const).map(([k, v]) => (
                            <li key={k} className="flex items-center justify-between">
                              <span className="text-muted-foreground">{k}</span>
                              <span className="flex items-center gap-1 capitalize text-foreground"><StatusIcon status={v} />{v ?? "unknown"}</span>
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-sm text-muted-foreground">Not monitored. <Link to="/simulator" className="text-primary underline">Add it</Link></p>}
                    </section>

                    <section className="rounded-lg border border-border p-4">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><Ban className="w-4 h-4" />Blacklists</h3>
                      {dom ? (
                        <div className="space-y-2 text-sm">
                          <p className="flex items-center gap-2 capitalize text-foreground"><StatusIcon status={dom.blacklist_status} />{dom.blacklist_status ?? "unknown"}</p>
                          {lastCheck && (
                            <>
                              <p className="text-muted-foreground">Listed on {lastCheck.listed_count} list{lastCheck.listed_count === 1 ? "" : "s"}</p>
                              {lastCheck.reputation_score != null && <p className="text-muted-foreground">Reputation score {lastCheck.reputation_score}/100</p>}
                            </>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {dom.last_check_at ? `Checked ${new Date(dom.last_check_at).toLocaleString()}` : "Not checked yet"}
                          </p>
                        </div>
                      ) : <p className="text-sm text-muted-foreground">No blacklist data.</p>}
                    </section>

                    <section className="rounded-lg border border-border p-4">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><Flame className="w-4 h-4" />Warmup</h3>
                      {plan ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground capitalize">{plan.status}</span><span className="font-medium text-foreground">{pct}%</span></div>
                          <Progress value={pct} className="h-2" />
                          <p className="text-muted-foreground">Day {plan.current_day} of {totalDays} · {doneDays} logged</p>
                          {issues > 0 && <p className="text-destructive">{issues} day{issues === 1 ? "" : "s"} with issues</p>}
                        </div>
                      ) : <p className="text-sm text-muted-foreground">No warmup plan. <Link to="/warmup" className="text-primary underline">Start one</Link></p>}
                    </section>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DomainHealth;
