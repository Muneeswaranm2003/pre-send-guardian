import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Shield,
  Plus,
  RefreshCw,
  Bell,
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Server,
  TrendingUp,
  Clock,
} from "lucide-react";

interface MonitoredDomain {
  id: string;
  domain: string;
  ip_address: string | null;
  overall_health: number;
  spf_status: string | null;
  dkim_status: string | null;
  dmarc_status: string | null;
  blacklist_status: string | null;
  last_check_at: string | null;
  is_active: boolean;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_read: boolean;
  created_at: string;
  domain_id: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [domains, setDomains] = useState<MonitoredDomain[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
      // Set up auto-refresh every 5 minutes
      const interval = setInterval(fetchData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch domains
      const { data: domainsData, error: domainsError } = await supabase
        .from("monitored_domains")
        .select("*")
        .order("created_at", { ascending: false });

      if (domainsError) throw domainsError;
      setDomains(domainsData || []);

      // Fetch alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from("monitoring_alerts")
        .select("*")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const refreshAllDomains = async () => {
    setRefreshing(true);
    toast.info("Refreshing all domains...");

    for (const domain of domains) {
      try {
        // Verify DNS
        const { data: dnsData } = await supabase.functions.invoke("verify-dns", {
          body: { domain: domain.domain, dkimSelector: "google" },
        });

        // Check blacklists if IP is set
        let blacklistStatus = "unknown";
        if (domain.ip_address) {
          const { data: blData } = await supabase.functions.invoke("check-blacklist", {
            body: { ip: domain.ip_address, domain: domain.domain },
          });
          if (blData?.summary) {
            blacklistStatus = blData.summary.status;
          }
        }

        // Update domain record
        await supabase
          .from("monitored_domains")
          .update({
            spf_status: dnsData?.spf?.valid ? "valid" : dnsData?.spf?.found ? "invalid" : "missing",
            dkim_status: dnsData?.dkim?.valid ? "valid" : dnsData?.dkim?.found ? "invalid" : "missing",
            dmarc_status: dnsData?.dmarc?.valid ? "valid" : dnsData?.dmarc?.found ? "invalid" : "missing",
            blacklist_status: blacklistStatus,
            overall_health: dnsData?.overallScore || 0,
            last_check_at: new Date().toISOString(),
          })
          .eq("id", domain.id);
      } catch (error) {
        console.error(`Error refreshing ${domain.domain}:`, error);
      }
    }

    await fetchData();
    setRefreshing(false);
    toast.success("All domains refreshed!");
  };

  const markAlertRead = async (alertId: string) => {
    await supabase.from("monitoring_alerts").update({ is_read: true }).eq("id", alertId);
    setAlerts(alerts.filter((a) => a.id !== alertId));
  };

  const getHealthBadge = (health: number) => {
    if (health >= 80) {
      return <Badge className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/80">Healthy</Badge>;
    } else if (health >= 50) {
      return <Badge className="bg-[hsl(var(--warning))] hover:bg-[hsl(var(--warning))]/80">Warning</Badge>;
    } else {
      return <Badge variant="destructive">Critical</Badge>;
    }
  };

  const getStatusIcon = (status: string | null) => {
    if (status === "valid") return <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />;
    if (status === "invalid") return <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))]" />;
    if (status === "missing") return <XCircle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const healthyDomains = domains.filter((d) => d.overall_health >= 80).length;
  const warningDomains = domains.filter((d) => d.overall_health >= 50 && d.overall_health < 80).length;
  const criticalDomains = domains.filter((d) => d.overall_health < 50).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Monitoring Dashboard</h1>
              <p className="text-muted-foreground">Live domain health and deliverability tracking</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={refreshAllDomains} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh All
              </Button>
              <Button onClick={() => navigate("/simulator")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Domain
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{domains.length}</p>
                    <p className="text-sm text-muted-foreground">Total Domains</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-[hsl(var(--success))]/10">
                    <CheckCircle className="w-6 h-6 text-[hsl(var(--success))]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{healthyDomains}</p>
                    <p className="text-sm text-muted-foreground">Healthy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-[hsl(var(--warning))]/10">
                    <AlertTriangle className="w-6 h-6 text-[hsl(var(--warning))]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{warningDomains}</p>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-destructive/10">
                    <XCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{criticalDomains}</p>
                    <p className="text-sm text-muted-foreground">Critical</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Domains Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Monitored Domains
                  </CardTitle>
                  <CardDescription>Real-time domain health status</CardDescription>
                </CardHeader>
                <CardContent>
                  {domains.length === 0 ? (
                    <div className="text-center py-12">
                      <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No domains monitored</h3>
                      <p className="text-muted-foreground mb-4">
                        Add your first domain to start monitoring
                      </p>
                      <Button onClick={() => navigate("/simulator")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Domain
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Domain</TableHead>
                            <TableHead>Health</TableHead>
                            <TableHead>SPF</TableHead>
                            <TableHead>DKIM</TableHead>
                            <TableHead>DMARC</TableHead>
                            <TableHead>Blacklist</TableHead>
                            <TableHead>Last Check</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {domains.map((domain) => (
                            <TableRow key={domain.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">{domain.domain}</span>
                                </div>
                              </TableCell>
                              <TableCell>{getHealthBadge(domain.overall_health)}</TableCell>
                              <TableCell>{getStatusIcon(domain.spf_status)}</TableCell>
                              <TableCell>{getStatusIcon(domain.dkim_status)}</TableCell>
                              <TableCell>{getStatusIcon(domain.dmarc_status)}</TableCell>
                              <TableCell>
                                {domain.blacklist_status === "clean" ? (
                                  <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
                                ) : domain.blacklist_status === "warning" ? (
                                  <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))]" />
                                ) : domain.blacklist_status === "critical" ? (
                                  <XCircle className="w-4 h-4 text-destructive" />
                                ) : (
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {domain.last_check_at
                                  ? new Date(domain.last_check_at).toLocaleString()
                                  : "Never"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Alerts Panel */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Recent Alerts
                  </CardTitle>
                  <CardDescription>Unread notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-10 h-10 text-[hsl(var(--success))] mx-auto mb-3" />
                      <p className="text-muted-foreground">No new alerts</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-lg border ${
                            alert.severity === "critical"
                              ? "border-destructive/30 bg-destructive/5"
                              : alert.severity === "warning"
                              ? "border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5"
                              : "border-border bg-accent/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              {alert.severity === "critical" ? (
                                <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                              ) : alert.severity === "warning" ? (
                                <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))] mt-0.5" />
                              ) : (
                                <Bell className="w-4 h-4 text-primary mt-0.5" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-foreground">{alert.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(alert.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAlertRead(alert.id)}
                            >
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
