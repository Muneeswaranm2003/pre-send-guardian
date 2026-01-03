import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Major blacklist providers to check
const BLACKLIST_PROVIDERS = [
  { name: "Spamhaus SBL", zone: "sbl.spamhaus.org", type: "ip" },
  { name: "Spamhaus XBL", zone: "xbl.spamhaus.org", type: "ip" },
  { name: "Spamhaus PBL", zone: "pbl.spamhaus.org", type: "ip" },
  { name: "Spamhaus DBL", zone: "dbl.spamhaus.org", type: "domain" },
  { name: "Barracuda", zone: "b.barracudacentral.org", type: "ip" },
  { name: "SpamCop", zone: "bl.spamcop.net", type: "ip" },
  { name: "SORBS", zone: "dnsbl.sorbs.net", type: "ip" },
  { name: "UCEPROTECT L1", zone: "dnsbl-1.uceprotect.net", type: "ip" },
  { name: "UCEPROTECT L2", zone: "dnsbl-2.uceprotect.net", type: "ip" },
  { name: "Invaluement", zone: "invaluement.com", type: "domain" },
  { name: "SURBL", zone: "multi.surbl.org", type: "domain" },
  { name: "URIBL", zone: "multi.uribl.com", type: "domain" },
];

function reverseIP(ip: string): string {
  return ip.split(".").reverse().join(".");
}

async function checkDNSBL(query: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${query}&type=A`,
      {
        headers: {
          Accept: "application/dns-json",
        },
      }
    );

    if (!response.ok) return false;

    const data = await response.json();
    // If we get an answer, the IP/domain is listed
    return data.Answer && data.Answer.length > 0;
  } catch (error) {
    console.error(`Error checking ${query}:`, error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ip, domain } = await req.json();

    if (!ip && !domain) {
      return new Response(
        JSON.stringify({ error: "Either IP or domain is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Checking blacklists for IP: ${ip}, Domain: ${domain}`);

    const results = [];

    // Check IP-based blacklists
    if (ip) {
      const reversedIP = reverseIP(ip);
      
      for (const provider of BLACKLIST_PROVIDERS.filter((p) => p.type === "ip")) {
        const query = `${reversedIP}.${provider.zone}`;
        const isListed = await checkDNSBL(query);
        
        results.push({
          provider: provider.name,
          checkType: "ip",
          isListed,
          query,
        });
        
        console.log(`${provider.name}: ${isListed ? "LISTED" : "Clean"}`);
      }
    }

    // Check domain-based blacklists
    if (domain) {
      const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
      
      for (const provider of BLACKLIST_PROVIDERS.filter((p) => p.type === "domain")) {
        const query = `${cleanDomain}.${provider.zone}`;
        const isListed = await checkDNSBL(query);
        
        results.push({
          provider: provider.name,
          checkType: "domain",
          isListed,
          query,
        });
        
        console.log(`${provider.name}: ${isListed ? "LISTED" : "Clean"}`);
      }
    }

    const listedCount = results.filter((r) => r.isListed).length;
    const totalChecks = results.length;

    return new Response(
      JSON.stringify({
        results,
        summary: {
          totalChecks,
          listedCount,
          cleanCount: totalChecks - listedCount,
          status: listedCount === 0 ? "clean" : listedCount > 2 ? "critical" : "warning",
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Blacklist check error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
