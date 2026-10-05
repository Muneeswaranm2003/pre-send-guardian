import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const status = (r?: { valid?: boolean; found?: boolean }) =>
  r?.valid ? "valid" : r?.found ? "invalid" : "missing";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const call = async (name: string, body: unknown) => {
    const res = await fetch(`${url}/functions/v1/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: anon, Authorization: `Bearer ${anon}` },
      body: JSON.stringify(body),
    });
    return res.ok ? await res.json() : null;
  };

  const { data: domains, error } = await admin
    .from("monitored_domains")
    .select("*")
    .eq("is_active", true)
    .limit(500);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let checked = 0;
  let alerts = 0;
  for (const d of domains ?? []) {
    try {
      const dns = await call("verify-dns", { domain: d.domain, dkimSelector: d.dkim_selector || "google" });
      const bl = await call("check-blacklist", { domain: d.domain, ip: d.ip_address || undefined });
      const authScore = Math.round(dns?.overallScore ?? 0);
      const blStatus: string = bl?.summary?.status ?? "unknown";
      const listed: number = bl?.summary?.listedCount ?? 0;
      const rep: number | null = bl?.reputation?.score ?? null;
      const health = Math.round(rep != null ? authScore * 0.6 + rep * 0.4 : authScore);

      await admin.from("monitored_domains").update({
        spf_status: status(dns?.spf), dkim_status: status(dns?.dkim), dmarc_status: status(dns?.dmarc),
        blacklist_status: blStatus, overall_health: health, last_check_at: new Date().toISOString(),
      }).eq("id", d.id);

      await admin.from("domain_check_history").insert({
        user_id: d.user_id, domain_id: d.id, domain: d.domain,
        spf_status: status(dns?.spf), dkim_status: status(dns?.dkim), dmarc_status: status(dns?.dmarc),
        auth_score: authScore, blacklist_status: blStatus, listed_count: listed,
        reputation_score: rep, health_score: health, source: "scheduled",
      });

      const newAlerts: { alert_type: string; severity: string; message: string }[] = [];
      if (blStatus !== "clean" && blStatus !== "unknown" && d.blacklist_status !== blStatus) {
        newAlerts.push({
          alert_type: "blacklist", severity: blStatus === "critical" ? "critical" : "warning",
          message: `${d.domain} is now listed on ${listed} blacklist${listed === 1 ? "" : "s"}.`,
        });
      }
      if ((d.overall_health ?? 0) - health >= 20) {
        newAlerts.push({
          alert_type: "health_drop", severity: "warning",
          message: `${d.domain} health dropped from ${d.overall_health} to ${health}.`,
        });
      }
      for (const a of newAlerts) {
        await admin.from("monitoring_alerts").insert({ ...a, user_id: d.user_id, domain_id: d.id });
        alerts++;
      }
      checked++;
    } catch (e) {
      console.error(`daily-checks ${d.domain}:`, e instanceof Error ? e.message : e);
    }
  }

  return new Response(JSON.stringify({ checked, alerts }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
