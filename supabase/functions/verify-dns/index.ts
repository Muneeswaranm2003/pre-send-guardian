import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DnsRecord {
  type: string;
  value: string;
}

interface DnsVerificationResult {
  spf: {
    found: boolean;
    valid: boolean;
    record: string | null;
    issues: string[];
    recommendations: string[];
  };
  dkim: {
    found: boolean;
    valid: boolean;
    selector: string;
    record: string | null;
    issues: string[];
    recommendations: string[];
  };
  dmarc: {
    found: boolean;
    valid: boolean;
    record: string | null;
    policy: string | null;
    issues: string[];
    recommendations: string[];
  };
  overallScore: number;
  overallStatus: "pass" | "warning" | "fail";
}

async function queryDns(domain: string, type: string): Promise<DnsRecord[]> {
  try {
    // Use Cloudflare's DNS-over-HTTPS API
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`;
    
    const response = await fetch(url, {
      headers: {
        "Accept": "application/dns-json",
      },
    });

    if (!response.ok) {
      console.log(`DNS query failed for ${domain} (${type}): ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (!data.Answer) {
      console.log(`No DNS answer for ${domain} (${type})`);
      return [];
    }

    return data.Answer.map((record: any) => ({
      type: type,
      value: record.data?.replace(/^"|"$/g, "") || record.data,
    }));
  } catch (error) {
    console.error(`DNS query error for ${domain} (${type}):`, error);
    return [];
  }
}

function analyzeSPF(records: DnsRecord[]): DnsVerificationResult["spf"] {
  const spfRecords = records.filter(r => r.value?.startsWith("v=spf1"));
  
  if (spfRecords.length === 0) {
    return {
      found: false,
      valid: false,
      record: null,
      issues: ["No SPF record found"],
      recommendations: [
        "Add an SPF record to authorize your mail servers",
        "Example: v=spf1 include:_spf.google.com ~all",
      ],
    };
  }

  if (spfRecords.length > 1) {
    return {
      found: true,
      valid: false,
      record: spfRecords[0].value,
      issues: ["Multiple SPF records found - only one is allowed"],
      recommendations: ["Merge all SPF records into a single record"],
    };
  }

  const spfValue = spfRecords[0].value;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for common SPF issues
  if (!spfValue.includes("~all") && !spfValue.includes("-all") && !spfValue.includes("?all")) {
    issues.push("SPF record missing 'all' mechanism");
    recommendations.push("Add ~all or -all at the end of your SPF record");
  }

  if (spfValue.includes("+all")) {
    issues.push("SPF uses +all which allows any server to send mail");
    recommendations.push("Change +all to ~all or -all for better security");
  }

  // Count DNS lookups (max 10 allowed)
  const lookupMechanisms = (spfValue.match(/include:|a:|mx:|ptr:|redirect=/g) || []).length;
  if (lookupMechanisms > 10) {
    issues.push(`SPF exceeds 10 DNS lookup limit (found ${lookupMechanisms})`);
    recommendations.push("Flatten your SPF record or reduce includes");
  }

  return {
    found: true,
    valid: issues.length === 0,
    record: spfValue,
    issues,
    recommendations,
  };
}

function analyzeDKIM(records: DnsRecord[], selector: string): DnsVerificationResult["dkim"] {
  if (records.length === 0) {
    return {
      found: false,
      valid: false,
      selector,
      record: null,
      issues: [`No DKIM record found for selector "${selector}"`],
      recommendations: [
        "Configure DKIM signing with your email provider",
        "Common selectors: google, selector1, selector2, default",
      ],
    };
  }

  const dkimValue = records[0].value;
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (!dkimValue.includes("v=DKIM1")) {
    issues.push("DKIM record missing version tag");
  }

  if (!dkimValue.includes("p=")) {
    issues.push("DKIM record missing public key");
    recommendations.push("Ensure your DKIM record includes the public key (p=)");
  }

  // Check for empty public key (revoked)
  if (dkimValue.includes("p=;") || dkimValue.match(/p=\s*$/)) {
    issues.push("DKIM public key is empty (record may be revoked)");
    recommendations.push("Generate a new DKIM key pair");
  }

  return {
    found: true,
    valid: issues.length === 0,
    selector,
    record: dkimValue.substring(0, 100) + (dkimValue.length > 100 ? "..." : ""),
    issues,
    recommendations,
  };
}

function analyzeDMARC(records: DnsRecord[]): DnsVerificationResult["dmarc"] {
  const dmarcRecords = records.filter(r => r.value?.startsWith("v=DMARC1"));

  if (dmarcRecords.length === 0) {
    return {
      found: false,
      valid: false,
      record: null,
      policy: null,
      issues: ["No DMARC record found"],
      recommendations: [
        "Add a DMARC record to protect your domain from spoofing",
        "Start with: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com",
      ],
    };
  }

  const dmarcValue = dmarcRecords[0].value;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Extract policy
  const policyMatch = dmarcValue.match(/p=(\w+)/);
  const policy = policyMatch ? policyMatch[1] : null;

  if (!policy) {
    issues.push("DMARC record missing policy (p=)");
    recommendations.push("Add a policy: p=none, p=quarantine, or p=reject");
  } else if (policy === "none") {
    issues.push("DMARC policy is set to 'none' (monitoring only)");
    recommendations.push("Consider upgrading to p=quarantine or p=reject for better protection");
  }

  // Check for reporting
  if (!dmarcValue.includes("rua=")) {
    issues.push("No aggregate reporting email configured");
    recommendations.push("Add rua= to receive DMARC reports");
  }

  // Check subdomain policy
  if (!dmarcValue.includes("sp=") && policy === "reject") {
    recommendations.push("Consider adding sp= for subdomain policy");
  }

  return {
    found: true,
    valid: policy === "quarantine" || policy === "reject",
    record: dmarcValue,
    policy,
    issues,
    recommendations,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, dkimSelector = "google" } = await req.json();

    if (!domain) {
      return new Response(
        JSON.stringify({ error: "Domain is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean domain
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
    
    console.log(`Checking DNS records for: ${cleanDomain}`);
    console.log(`DKIM selector: ${dkimSelector}`);

    // Query DNS records in parallel
    const [spfRecords, dkimRecords, dmarcRecords] = await Promise.all([
      queryDns(cleanDomain, "TXT"),
      queryDns(`${dkimSelector}._domainkey.${cleanDomain}`, "TXT"),
      queryDns(`_dmarc.${cleanDomain}`, "TXT"),
    ]);

    console.log(`SPF records found: ${spfRecords.length}`);
    console.log(`DKIM records found: ${dkimRecords.length}`);
    console.log(`DMARC records found: ${dmarcRecords.length}`);

    // Analyze each record type
    const spf = analyzeSPF(spfRecords);
    const dkim = analyzeDKIM(dkimRecords, dkimSelector);
    const dmarc = analyzeDMARC(dmarcRecords);

    // Calculate overall score
    let score = 0;
    let maxScore = 0;

    // SPF scoring (30 points)
    maxScore += 30;
    if (spf.found) score += 15;
    if (spf.valid) score += 15;

    // DKIM scoring (35 points)
    maxScore += 35;
    if (dkim.found) score += 20;
    if (dkim.valid) score += 15;

    // DMARC scoring (35 points)
    maxScore += 35;
    if (dmarc.found) score += 15;
    if (dmarc.valid) score += 20;

    const overallScore = Math.round((score / maxScore) * 100);
    let overallStatus: "pass" | "warning" | "fail";

    if (overallScore >= 80) {
      overallStatus = "pass";
    } else if (overallScore >= 50) {
      overallStatus = "warning";
    } else {
      overallStatus = "fail";
    }

    const result: DnsVerificationResult = {
      spf,
      dkim,
      dmarc,
      overallScore,
      overallStatus,
    };

    console.log(`Overall score: ${overallScore}%, status: ${overallStatus}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error verifying DNS:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
