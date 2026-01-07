import { memo } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

const TRADITIONAL_ISSUES = [
  "Send first, analyze later",
  "Discover issues from open rate drops",
  "Domain reputation already damaged",
  "Recovery takes weeks",
] as const;

const SPAMGUARD_BENEFITS = [
  "Predict risk before sending",
  "Get actionable recommendations",
  "Protect your domain reputation",
  "Prevent issues before they happen",
] as const;

function ProblemSection() {
  return (
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
              {TRADITIONAL_ISSUES.map((issue, i) => (
                <li key={i}>• {issue}</li>
              ))}
            </ul>
          </div>
          
          <div className="p-6 rounded-xl border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5">
            <h3 className="text-lg font-semibold text-[hsl(var(--success))] mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              SpamGuard Approach
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {SPAMGUARD_BENEFITS.map((benefit, i) => (
                <li key={i}>• {benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ProblemSection);
