import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeatureCard from "@/components/FeatureCard";
import PricingCard from "@/components/PricingCard";
import RiskGauge from "@/components/RiskGauge";
import {
  Shield,
  Mail,
  BarChart3,
  Lock,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Globe,
  Server,
  Users,
} from "lucide-react";

const Index = () => {
  const features = [
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

  const pricingPlans = [
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

  const howItWorks = [
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
        <div className="relative container py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                Stop losing emails to spam folders
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Know Your Spam Risk{" "}
                <span className="text-primary">Before</span> You Send
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Predict email deliverability with AI-powered analysis. 
                Protect your domain reputation and maximize inbox placement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/simulator">
                    Try Free Simulator
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="heroOutline" size="xl">
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
                  Free forever plan
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="relative p-8 rounded-2xl bg-card border border-border shadow-xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  LIVE PREVIEW
                </div>
                <RiskGauge riskScore={72} size="lg" />
                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    Domain age only 14 days
                  </div>
                  <div className="flex items-center gap-2 text-[hsl(var(--warning))]">
                    <AlertTriangle className="w-4 h-4" />
                    Volume 4x above average
                  </div>
                  <div className="flex items-center gap-2 text-[hsl(var(--info))]">
                    <AlertTriangle className="w-4 h-4" />
                    38% inactive recipients
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2M+", label: "Emails Analyzed" },
              { value: "98%", label: "Accuracy Rate" },
              { value: "5,000+", label: "Happy Users" },
              { value: "45%", label: "Avg. Improvement" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Problem with Current Email Tools
            </h2>
            <p className="text-lg text-muted-foreground">
              Existing solutions only tell you what happened after sending. 
              By then, the damage to your reputation is already done.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5">
              <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Traditional Approach
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>• Send first, analyze later</li>
                <li>• Discover issues from open rate drops</li>
                <li>• Domain reputation already damaged</li>
                <li>• Recovery takes weeks</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5">
              <h3 className="text-lg font-semibold text-[hsl(var(--success))] mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                SpamGuard Approach
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>• Predict risk before sending</li>
                <li>• Get actionable recommendations</li>
                <li>• Protect your domain reputation</li>
                <li>• Prevent issues before they happen</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-card border-y border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your spam risk score in under 30 seconds with our simple 3-step process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {i < howItWorks.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-border" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="hero" size="lg" asChild>
              <Link to="/simulator">
                Try It Now - Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comprehensive Risk Analysis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We analyze multiple signals to give you the most accurate deliverability prediction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={i * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 bg-card border-y border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <PricingCard key={i} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl bg-[image:var(--gradient-primary)]">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Protect Your Email Reputation?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Join thousands of marketers who prevent spam issues before they happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="xl" 
                className="bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link to="/simulator">
                  Start Free Simulation
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
