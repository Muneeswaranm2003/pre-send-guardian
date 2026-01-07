import type { LucideIcon } from "lucide-react";

// Core application types

export interface NavLinkItem {
  name: string;
  path: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Stat {
  value: string;
  label: string;
}

// Simulator types
export type ConnectionMethod = "ip" | "smtp" | "api";

export interface SimulatorState {
  // Step 1: Domain
  domain: string;
  domainAge: string;
  dkimSelector: string;
  // Step 2: IP & SMTP
  connectionMethod: ConnectionMethod;
  ipAddress: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  apiKey: string;
  apiProvider: string;
  volume: number[];
  // Step 3: Email Content
  subject: string;
  emailContent: string;
}

export interface WizardStep {
  id: number;
  title: string;
  description: string;
}

// Dashboard types
export interface MonitoredDomain {
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

export interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_read: boolean;
  created_at: string;
  domain_id: string;
}

// DNS Verification types
export interface DkimSelectorResult {
  selector: string;
  found: boolean;
  valid: boolean;
  record?: string;
  issues?: string[];
}

export interface DnsRecord {
  found: boolean;
  valid: boolean;
  record?: string;
  issues?: string[];
  recommendations?: string[];
}

export interface DnsVerificationResult {
  spf: DnsRecord;
  dkim: {
    found: boolean;
    valid: boolean;
    selectors: DkimSelectorResult[];
    issues?: string[];
    recommendations?: string[];
  };
  dmarc: DnsRecord & {
    policy?: string;
  };
  overallScore: number;
  status: "excellent" | "good" | "warning" | "critical";
}

// Blacklist types
export interface BlacklistResult {
  provider: string;
  isListed: boolean;
  type: "ip" | "domain";
  returnCode?: string;
  codeInfo?: {
    type: string;
    severity: string;
    description: string;
  };
}

export interface ReputationFactor {
  name: string;
  status: string;
  impact: number;
  description: string;
}

export interface DomainReputation {
  score: number;
  grade: string;
  factors: ReputationFactor[];
}
