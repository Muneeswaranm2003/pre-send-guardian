import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck, CheckCircle2, Circle, Flame, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FullPageSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Plan = Tables<"warmup_plans">;
type Log = Tables<"warmup_daily_logs">;
type Check = Tables<"domain_check_history">;
type Domain = Tables<"monitored_domains">;

const dayKey = (d: Date | string) => new Date(d).toISOString().slice(0, 10);
const avg = (n: number[]) => (n.length ? n.reduce((a, b) => a + b, 0) / n.length : null);

const Today = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [checks, setChecks] = useState<Check[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [reviewedToday, setReviewedToday] = useState(false);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  const load = useCallback(async () => {
    if (!user) return;
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const [p, l, c, d, a, r, t] = await Promise.all([
      supabase.from("warmup_plans").select("*"),
      supabase.from("warmup_daily_logs").select("*").gte("created_at", new Date(Date.now() - 400 * 864e5).toISOString()).order("log_date", { ascending: false }),
      supabase.from("domain_check_history").select("*").gte("checked_at", since).order("checked_at"),
      supabase.from("monitored_domains").select("*"),
      supabase.from("monitoring_alerts").select("id", { count: "exact", head: true }).eq("is_read", false),
      supabase.from("warmup_ai_reviews").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
      supabase.from("email_templates").select("id", { count: "exact", head: true }).gte("last_checked_at", todayStart.toISOString()),
    ]);
    setPlans(p.data ?? []); setLogs(l.data ?? []); setChecks(c.data ?? []); setDomains(d.data ?? []);
    setUnreadAlerts(a.count ?? 0); setReviewedToday((r.count ?? 0) + (t.count ?? 0) > 0);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const today = dayKey(new Date());
  const activePlans = plans.filter((p) => p.status === "active");
  const unlogged = activePlans.filter((p) => !logs.some((l) => l.plan_id === p.id && l.day_number === p.current_day));
  const checkedToday = domains.length > 0 && domains.every((d) => checks.some((c) => c.domain_id === d.id && dayKey(c.checked_at) === today));

  const tasks = [
    { done: activePlans.length > 0 && unlogged.length === 0, label: activePlans.length ? `Log today's warmup sends (${activePlans.length - unlogged.length}/${activePlans.length})` : "Start a warmup plan", to: "/warmup" },
    { done: checkedToday, label: domains.length ? "Run today's DNS & blacklist check" : "Add a domain to monitor", to: domains.length ? "/dashboard" : "/simulator" },
    { done: unreadAlerts === 0, label: unreadAlerts ? `Review ${unreadAlerts} open alert${unreadAlerts > 1 ? "s" : ""}` : "No open alerts", to: "/dashboard" },
    { done: reviewedToday, label: "AI Review the email going out today", to: "/advisor" },
  ];
  const doneCount = tasks.filter((t) => t.done).length;

  const streak = useMemo(() => {
    const days = new Set(logs.map((l) => l.log_date));
    let n = 0; const d = new Date();
    if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
    while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [logs]);

  const health = useMemo(() => {
    const domainAvg = avg(domains.map((d) => d.overall_health ?? 0)) ?? 100;
    const listed = domains.filter((d) => d.blacklist_status && !["clean", "unknown"].includes(d.blacklist_status)).length;
    const recent = logs.filter((l) => l.bounce_rate != null && Date.now() - new Date(l.log_date).getTime() < 7 * 864e5);
    const bounce = avg(recent.map((l) => Number(l.bounce_rate))) ?? 0;
    const score = domainAvg - listed * 20 - Math.min(unreadAlerts, 5) * 4 - Math.max(0, bounce - 2) * 10;
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [domains, logs, unreadAlerts]);

  const chartData = useMemo(() => {
    const byDay: Record<string, Record<string, number>> = {};
    checks.forEach((c) => { (byDay[dayKey(c.checked_at)] ??= {})[c.domain] = c.health_score; });
    return Object.entries(byDay).sort().map(([day, v]) => ({ day: day.slice(5), ...v }));
  }, [checks]);
  const domainNames = Array.from(new Set(checks.map((c) => c.domain)));
  const lineColors = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

  const weekly = useMemo(() => {
    const now = Date.now();
    const inRange = (t: string, a: number, b: number) => { const x = now - new Date(t).getTime(); return x >= a * 864e5 && x < b * 864e5; };
    const h1 = avg(checks.filter((c) => inRange(c.checked_at, 0, 7)).map((c) => c.health_score));
    const h0 = avg(checks.filter((c) => inRange(c.checked_at, 7, 14)).map((c) => c.health_score));
    const b1 = avg(logs.filter((l) => l.bounce_rate != null && inRange(l.log_date, 0, 7)).map((l) => Number(l.bounce_rate)));
    const b0 = avg(logs.filter((l) => l.bounce_rate != null && inRange(l.log_date, 7, 14)).map((l) => Number(l.bounce_rate)));
    const fixes: string[] = [];
    domains.forEach((d) => {
      if (d.blacklist_status && !["clean", "unknown"].includes(d.blacklist_status)) fixes.push(`Request delisting for ${d.domain} and pause bulk sends from it.`);
      if (d.dmarc_status !== "valid") fixes.push(`Publish a DMARC record for ${d.domain}.`);
      if (d.dkim_status !== "valid") fixes.push(`Set up DKIM signing for ${d.domain}.`);
      if (d.spf_status !== "valid") fixes.push(`Fix the SPF record for ${d.domain}.`);
    });
    if (b1 != null && b1 > 2) fixes.push("Bounce rate is above 2% — clean your list before raising warmup volume.");
    if (unlogged.length) fixes.push("Log warmup sends every day so problems are caught early.");
    return { h1, h0, b1, b0, fixes: fixes.slice(0, 3) };
  }, [checks, logs, domains, unlogged.length]);

  if (authLoading || loading) return <FullPageSpinner />;

  const Trend = ({ now, prev, higherIsBetter }: { now: number | null; prev: number | null; higherIsBetter: boolean }) => {
    if (now == null || prev == null || Math.abs(now - prev) < 0.5) return <Minus className="w-4 h-4 text-muted-foreground" />;
    const better = higherIsBetter ? now > prev : now < prev;
    const Icon = now > prev ? TrendingUp : TrendingDown;
    return <Icon className={`w-4 h-4 ${better ? "text-success" : "text-destructive"}`} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 max-w-6xl space-y-6">
        <PageHeader title="Today" description="Your 5-minute daily deliverability routine." icon={CalendarCheck} />

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Daily health score</p>
            <p className={`text-3xl font-bold ${health >= 80 ? "text-success" : health >= 50 ? "text-warning" : "text-destructive"}`}>{health}</p>
            <Progress value={health} className="h-2 mt-2" />
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Logging streak</p>
            <p className="text-3xl font-bold text-foreground flex items-center gap-2"><Flame className="w-6 h-6 text-primary" />{streak} day{streak === 1 ? "" : "s"}</p>
            <p className="text-xs text-muted-foreground mt-1">Days in a row with a warmup log</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Today's checklist</p>
            <p className="text-3xl font-bold text-foreground">{doneCount}/{tasks.length}</p>
            <Progress value={(doneCount / tasks.length) * 100} className="h-2 mt-2" />
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="font-semibold mb-3">Checklist</h2>
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.label} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
                <span className={`flex items-center gap-2 text-sm ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {t.done ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                  {t.label}
                </span>
                {!t.done && <Button asChild size="sm" variant="outline"><Link to={t.to}>Go</Link></Button>}
              </li>
            ))}
          </ul>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2 min-w-0">
            <h2 className="font-semibold mb-1 flex items-center gap-2"><Activity className="w-4 h-4" />30-day domain health</h2>
            <p className="text-xs text-muted-foreground mb-3">Checks run automatically every morning, plus any you run from the dashboard.</p>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">No checks yet. They'll appear here after the first daily check.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    {domainNames.map((n, i) => (
                      <Line key={n} type="monotone" dataKey={n} stroke={lineColors[i % lineColors.length]} strokeWidth={2} dot={false} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="font-semibold">This week vs last week</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg domain health</span>
              <span className="flex items-center gap-2 font-medium">{weekly.h1 != null ? Math.round(weekly.h1) : "—"}<Trend now={weekly.h1} prev={weekly.h0} higherIsBetter /></span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg bounce rate</span>
              <span className="flex items-center gap-2 font-medium">{weekly.b1 != null ? `${weekly.b1.toFixed(1)}%` : "—"}<Trend now={weekly.b1} prev={weekly.b0} higherIsBetter={false} /></span>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Top fixes</p>
              {weekly.fixes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing urgent — keep your routine going.</p>
              ) : (
                <ol className="list-decimal pl-5 space-y-1 text-sm text-foreground">
                  {weekly.fixes.map((f) => <li key={f}>{f}</li>)}
                </ol>
              )}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Today;
