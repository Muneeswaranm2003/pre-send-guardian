import {
  Shield,
  Mail,
  BarChart3,
  Lock,
  Zap,
  Globe,
  Server,
  CheckCircle,
} from "lucide-react";
import type { Feature, PricingPlan, HowItWorksStep, Stat, WizardStep } from "@/types";

export const FEATURES: Feature[] = [
  {
    icon: Shield,
    title: "Domain Reputation Analysis",
    description: "Check your domain age, warmup status, and historical sending patterns before each campaign.",
  },
  {
    icon: Lock,
    title: "Authentication Health",
    description: "Verify SPF, DKIM, and DMARC alignment to ensure your emails are properly authenticated.",
  },
  {
    icon: BarChart3,
    title: "Engagement Decay Tracking",
    description: "Monitor open rates, click trends, and inactive subscriber percentages over time.",
  },
  {
    icon: Mail,
    title: "Content Risk Scanner",
    description: "Analyze HTML-to-text ratios, link reputation, and image-only email detection.",
  },
  {
    icon: Zap,
    title: "Volume Risk Prediction",
    description: "Detect sudden spikes, time-of-day patterns, and ISP sensitivity issues.",
  },
  {
    icon: Globe,
    title: "ISP-Specific Insights",
    description: "Get detailed risk breakdowns for Gmail, Outlook, Yahoo, and other major providers.",
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Free",
    price: "Free",
    description: "Perfect for trying out SpamGuard",
    features: [
      "1 simulation per day",
      "Basic risk scoring",
      "Content analysis",
      "Email support",
    ],
    buttonText: "Get Started",
  },
  {
    name: "Starter",
    price: "$19",
    description: "For growing email marketers",
    features: [
      "50 simulations per month",
      "Full risk breakdown",
      "ISP-specific insights",
      "Historical comparisons",
      "Priority support",
    ],
    buttonText: "Start Free Trial",
  },
  {
    name: "Growth",
    price: "$49",
    description: "For teams and agencies",
    features: [
      "Unlimited simulations",
      "API access",
      "Team collaboration",
      "Auto-safe volume suggestions",
      "Dedicated support",
    ],
    popular: true,
    buttonText: "Start Free Trial",
  },
  {
    name: "Agency",
    price: "Custom",
    description: "For high-volume senders",
    features: [
      "Everything in Growth",
      "Multi-client management",
      "White-label reports",
      "Custom integrations",
      "SLA guarantee",
    ],
    buttonText: "Contact Sales",
  },
];

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    step: "01",
    title: "Upload Your Email",
    description: "Paste your email content or upload your HTML template for analysis.",
    icon: Mail,
  },
  {
    step: "02",
    title: "Configure Settings",
    description: "Select your sending domain, IP, and planned send volume.",
    icon: Server,
  },
  {
    step: "03",
    title: "Get Instant Results",
    description: "Receive your spam risk score with actionable recommendations.",
    icon: CheckCircle,
  },
];

export const STATS: Stat[] = [
  { value: "2M+", label: "Emails Analyzed" },
  { value: "98%", label: "Accuracy Rate" },
  { value: "5,000+", label: "Happy Users" },
  { value: "45%", label: "Avg. Improvement" },
];

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: "Domain", description: "Enter domain details" },
  { id: 2, title: "IP & SMTP", description: "Configure server" },
  { id: 3, title: "Email", description: "Add content" },
  { id: 4, title: "Verify", description: "Run simulation" },
];

export const SPAM_TRIGGER_WORDS = [
  "free",
  "urgent",
  "act now",
  "click here",
  "limited time",
  "winner",
  "guaranteed",
  "no obligation",
  "risk free",
  "double your",
  "earn money",
  "cash bonus",
] as const;

export const API_PROVIDERS = [
  { value: "sendgrid", label: "SendGrid" },
  { value: "mailgun", label: "Mailgun" },
  { value: "postmark", label: "Postmark" },
  { value: "sparkpost", label: "SparkPost" },
  { value: "mailchimp", label: "Mailchimp Transactional" },
  { value: "ses", label: "Amazon SES" },
] as const;

export const COMMON_DKIM_SELECTORS = [
  { value: "google", label: "Google", provider: "Google Workspace" },
  { value: "selector1", label: "selector1", provider: "Microsoft 365" },
  { value: "selector2", label: "selector2", provider: "Microsoft 365" },
  { value: "k1", label: "k1", provider: "Mailchimp" },
  { value: "s1", label: "s1", provider: "SendGrid" },
  { value: "pm", label: "pm", provider: "Postmark" },
  { value: "mandrill", label: "mandrill", provider: "Mailchimp Transactional" },
  { value: "default", label: "default", provider: "Generic" },
] as const;
