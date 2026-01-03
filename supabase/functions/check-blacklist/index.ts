import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Major blacklist providers to check
const BLACKLIST_PROVIDERS = [
  { name: "Spamhaus SBL", zone: "sbl.spamhaus.org", type: "ip", weight: 15 },
  { name: "Spamhaus XBL", zone: "xbl.spamhaus.org", type: "ip", weight: 12 },
  { name: "Spamhaus PBL", zone: "pbl.spamhaus.org", type: "ip", weight: 8 },
  { name: "Spamhaus DBL", zone: "dbl.spamhaus.org", type: "domain", weight: 15 },
  { name: "Barracuda", zone: "b.barracudacentral.org", type: "ip", weight: 10 },
  { name: "SpamCop", zone: "bl.spamcop.net", type: "ip", weight: 8 },
  { name: "SORBS", zone: "dnsbl.sorbs.net", type: "ip", weight: 7 },
  { name: "UCEPROTECT L1", zone: "dnsbl-1.uceprotect.net", type: "ip", weight: 6 },
  { name: "UCEPROTECT L2", zone: "dnsbl-2.uceprotect.net", type: "ip", weight: 5 },
  { name: "Invaluement", zone: "invaluement.com", type: "domain", weight: 8 },
  { name: "SURBL", zone: "multi.surbl.org", type: "domain", weight: 10 },
  { name: "URIBL", zone: "multi.uribl.com", type: "domain", weight: 9 },
];

// Domain reputation factors
const REPUTATION_FACTORS = {
  spamhausDBL: { weight: 25, description: "Spamhaus Domain Block List" },
  surbl: { weight: 20, description: "SURBL URI Reputation" },
  uribl: { weight: 15, description: "URIBL Domain Blacklist" },
  invaluement: { weight: 10, description: "Invaluement Anti-Spam" },
  ipBlacklists: { weight: 30, description: "IP-based Blacklists" },
};

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
    return data.Answer && data.Answer.length > 0;
  } catch (error) {
    console.error(`Error checking ${query}:`, error);
    return false;
  }
}

function calculateReputationScore(results: any[]): {
  score: number;
  grade: string;
  factors: { name: string; status: string; impact: number; description: string }[];
} {
  let totalWeight = 0;
  let penaltyWeight = 0;
  const factors: { name: string; status: string; impact: number; description: string }[] = [];

  // Group results by provider type
  const spamhausDBL = results.find(r => r.provider === "Spamhaus DBL");
  const surbl = results.find(r => r.provider === "SURBL");
  const uribl = results.find(r => r.provider === "URIBL");
  const invaluement = results.find(r => r.provider === "Invaluement");
  const ipBlacklists = results.filter(r => r.checkType === "ip");

  // Spamhaus DBL - highest impact for domain reputation
  if (spamhausDBL) {
    totalWeight += REPUTATION_FACTORS.spamhausDBL.weight;
    if (spamhausDBL.isListed) {
      penaltyWeight += REPUTATION_FACTORS.spamhausDBL.weight;
      factors.push({
        name: "Spamhaus DBL",
        status: "listed",
        impact: -REPUTATION_FACTORS.spamhausDBL.weight,
        description: "Domain is listed on Spamhaus Domain Block List - severe reputation impact",
      });
    } else {
      factors.push({
        name: "Spamhaus DBL",
        status: "clean",
        impact: 0,
        description: "Domain is NOT listed on Spamhaus DBL - good standing",
      });
    }
  }

  // SURBL
  if (surbl) {
    totalWeight += REPUTATION_FACTORS.surbl.weight;
    if (surbl.isListed) {
      penaltyWeight += REPUTATION_FACTORS.surbl.weight;
      factors.push({
        name: "SURBL",
        status: "listed",
        impact: -REPUTATION_FACTORS.surbl.weight,
        description: "Domain found in SURBL spam URI database",
      });
    } else {
      factors.push({
        name: "SURBL",
        status: "clean",
        impact: 0,
        description: "Not listed in SURBL",
      });
    }
  }

  // URIBL
  if (uribl) {
    totalWeight += REPUTATION_FACTORS.uribl.weight;
    if (uribl.isListed) {
      penaltyWeight += REPUTATION_FACTORS.uribl.weight;
      factors.push({
        name: "URIBL",
        status: "listed",
        impact: -REPUTATION_FACTORS.uribl.weight,
        description: "Domain listed in URIBL blacklist",
      });
    } else {
      factors.push({
        name: "URIBL",
        status: "clean",
        impact: 0,
        description: "Not listed in URIBL",
      });
    }
  }

  // Invaluement
  if (invaluement) {
    totalWeight += REPUTATION_FACTORS.invaluement.weight;
    if (invaluement.isListed) {
      penaltyWeight += REPUTATION_FACTORS.invaluement.weight;
      factors.push({
        name: "Invaluement",
        status: "listed",
        impact: -REPUTATION_FACTORS.invaluement.weight,
        description: "Domain flagged by Invaluement anti-spam",
      });
    } else {
      factors.push({
        name: "Invaluement",
        status: "clean",
        impact: 0,
        description: "Clean on Invaluement",
      });
    }
  }

  // IP Blacklists aggregate
  if (ipBlacklists.length > 0) {
    totalWeight += REPUTATION_FACTORS.ipBlacklists.weight;
    const listedIpCount = ipBlacklists.filter(r => r.isListed).length;
    if (listedIpCount > 0) {
      const penalty = Math.min(REPUTATION_FACTORS.ipBlacklists.weight, listedIpCount * 5);
      penaltyWeight += penalty;
      factors.push({
        name: "IP Blacklists",
        status: "listed",
        impact: -penalty,
        description: `IP listed on ${listedIpCount} blacklist(s) - affects sending reputation`,
      });
    } else {
      factors.push({
        name: "IP Blacklists",
        status: "clean",
        impact: 0,
        description: "IP is clean on all checked blacklists",
      });
    }
  }

  // Calculate score (100 = perfect, 0 = worst)
  const score = totalWeight > 0 ? Math.max(0, Math.round(100 - (penaltyWeight / totalWeight) * 100)) : 100;

  // Determine grade
  let grade: string;
  if (score >= 90) grade = "A";
  else if (score >= 80) grade = "B";
  else if (score >= 70) grade = "C";
  else if (score >= 50) grade = "D";
  else grade = "F";

  return { score, grade, factors };
}

serve(async (req) => {
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
          weight: provider.weight,
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
          weight: provider.weight,
        });
        
        console.log(`${provider.name}: ${isListed ? "LISTED" : "Clean"}`);
      }
    }

    const listedCount = results.filter((r) => r.isListed).length;
    const totalChecks = results.length;

    // Calculate domain reputation score
    const reputation = calculateReputationScore(results);

    return new Response(
      JSON.stringify({
        results,
        summary: {
          totalChecks,
          listedCount,
          cleanCount: totalChecks - listedCount,
          status: listedCount === 0 ? "clean" : listedCount > 2 ? "critical" : "warning",
        },
        reputation: {
          score: reputation.score,
          grade: reputation.grade,
          factors: reputation.factors,
          example: {
            provider: "Spamhaus DBL",
            description: "Spamhaus Domain Block List is one of the most trusted domain reputation sources. A listing here severely impacts email deliverability.",
            howToCheck: `Query: ${domain}.dbl.spamhaus.org`,
            delistingUrl: "https://www.spamhaus.org/lookup/",
          },
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