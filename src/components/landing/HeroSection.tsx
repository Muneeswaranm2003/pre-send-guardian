import { memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RiskGauge from "@/components/RiskGauge";
import { AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";

const DEMO_ISSUES = [
  { text: "Domain age only 14 days", color: "text-destructive" },
  { text: "Volume 4x above average", color: "text-[hsl(var(--warning))]" },
  { text: "38% inactive recipients", color: "text-[hsl(var(--info))]" },
] as const;

function HeroSection() {
  return (
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

          <div
            className="relative flex justify-center lg:justify-end animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <div className="relative p-8 rounded-2xl bg-card border border-border shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                LIVE PREVIEW
              </div>
              <RiskGauge riskScore={72} size="lg" />
              <div className="mt-6 space-y-2 text-sm">
                {DEMO_ISSUES.map((issue, i) => (
                  <div key={i} className={`flex items-center gap-2 ${issue.color}`}>
                    <AlertTriangle className="w-4 h-4" />
                    {issue.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(HeroSection);
