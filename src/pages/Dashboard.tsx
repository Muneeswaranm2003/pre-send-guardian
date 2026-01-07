import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useDashboard } from "@/hooks/useDashboard";
import { FullPageSpinner } from "@/components/ui/loading-spinner";
import { StatusIcon } from "@/components/ui/status-icon";
import { HealthBadge } from "@/components/ui/health-badge";
import {
  Plus,
  RefreshCw,
  Bell,
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    domains,
    alerts,
    loading,
    refreshing,
    healthyDomains,
    warningDomains,
    criticalDomains,
    refreshAllDomains,
    markAlertRead,
  } = useDashboard(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return <FullPageSpinner />;
  }

  const statsCards = [
    { icon: Globe, value: domains.length, label: "Total Domains", colorClass: "bg-primary/10", iconClass: "text-primary" },
    { icon: CheckCircle, value: healthyDomains, label: "Healthy", colorClass: "bg-[hsl(var(--success))]/10", iconClass: "text-[hsl(var(--success))]" },
    { icon: AlertTriangle, value: warningDomains, label: "Warnings", colorClass: "bg-[hsl(var(--warning))]/10", iconClass: "text-[hsl(var(--warning))]" },
    { icon: XCircle, value: criticalDomains, label: "Critical", colorClass: "bg-destructive/10", iconClass: "text-destructive" },
  ];

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
            {statsCards.map(({ icon: Icon, value, label, colorClass, iconClass }, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${colorClass}`}>
                      <Icon className={`w-6 h-6 ${iconClass}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{value}</p>
                      <p className="text-sm text-muted-foreground">{label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                              <TableCell>
                                <HealthBadge health={domain.overall_health} />
                              </TableCell>
                              <TableCell>
                                <StatusIcon status={domain.spf_status} />
                              </TableCell>
                              <TableCell>
                                <StatusIcon status={domain.dkim_status} />
                              </TableCell>
                              <TableCell>
                                <StatusIcon status={domain.dmarc_status} />
                              </TableCell>
                              <TableCell>
                                <StatusIcon status={domain.blacklist_status} />
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
                        <AlertItem
                          key={alert.id}
                          alert={alert}
                          onDismiss={() => markAlertRead(alert.id)}
                        />
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

interface AlertItemProps {
  alert: {
    id: string;
    severity: string;
    message: string;
    created_at: string;
  };
  onDismiss: () => void;
}

function AlertItem({ alert, onDismiss }: AlertItemProps) {
  const severityStyles = {
    critical: "border-destructive/30 bg-destructive/5",
    warning: "border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5",
    info: "border-border bg-accent/50",
  };

  const style = severityStyles[alert.severity as keyof typeof severityStyles] || severityStyles.info;

  return (
    <div className={`p-3 rounded-lg border ${style}`}>
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
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}

export default Dashboard;
