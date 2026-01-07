import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MonitoredDomain, Alert } from "@/types";

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useDashboard(userId: string | undefined) {
  const [domains, setDomains] = useState<MonitoredDomain[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    
    try {
      const [domainsResult, alertsResult] = await Promise.all([
        supabase
          .from("monitored_domains")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("monitoring_alerts")
          .select("*")
          .eq("is_read", false)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (domainsResult.error) throw domainsResult.error;
      if (alertsResult.error) throw alertsResult.error;

      setDomains(domainsResult.data || []);
      setAlerts(alertsResult.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
      const interval = setInterval(fetchData, AUTO_REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [userId, fetchData]);

  const refreshAllDomains = useCallback(async () => {
    if (domains.length === 0) return;
    
    setRefreshing(true);
    toast.info("Refreshing all domains...");

    try {
      await Promise.all(
        domains.map(async (domain) => {
          try {
            const { data: dnsData } = await supabase.functions.invoke("verify-dns", {
              body: { domain: domain.domain, dkimSelector: "google" },
            });

            let blacklistStatus = "unknown";
            if (domain.ip_address) {
              const { data: blData } = await supabase.functions.invoke("check-blacklist", {
                body: { ip: domain.ip_address, domain: domain.domain },
              });
              if (blData?.summary) {
                blacklistStatus = blData.summary.status;
              }
            }

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
        })
      );

      await fetchData();
      toast.success("All domains refreshed!");
    } finally {
      setRefreshing(false);
    }
  }, [domains, fetchData]);

  const markAlertRead = useCallback(async (alertId: string) => {
    await supabase.from("monitoring_alerts").update({ is_read: true }).eq("id", alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  // Computed values
  const healthyDomains = domains.filter((d) => d.overall_health >= 80).length;
  const warningDomains = domains.filter((d) => d.overall_health >= 50 && d.overall_health < 80).length;
  const criticalDomains = domains.filter((d) => d.overall_health < 50).length;

  return {
    domains,
    alerts,
    loading,
    refreshing,
    healthyDomains,
    warningDomains,
    criticalDomains,
    fetchData,
    refreshAllDomains,
    markAlertRead,
  };
}
