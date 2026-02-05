import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Globe, ArrowRight, Shield, Lock, Key, Plus, X, Info, TrendingUp, AlertTriangle, Flame, Mail } from "lucide-react";

// Domain warmup percentage based on age
const WARMUP_PERCENTAGE: Record<string, { percent: number; label: string }> = {
  new: { percent: 5, label: "Just Started" },
  month: { percent: 15, label: "Early Stage" },
  quarter: { percent: 35, label: "Building" },
  half: { percent: 55, label: "Maturing" },
  year: { percent: 75, label: "Established" },
  established: { percent: 90, label: "Well Warmed" },
  mature: { percent: 100, label: "Fully Warmed" },
};

// Volume recommendations based on domain age
const VOLUME_RECOMMENDATIONS: Record<string, { daily: string; weekly: string; tip: string; color: string; providers: { gmail: string; outlook: string; yahoo: string } }> = {
  new: {
    daily: "20-50",
    weekly: "100-250",
    tip: "Start very slow. Send to your most engaged contacts only.",
    color: "destructive",
    providers: {
      gmail: "10-20/day",
      outlook: "15-30/day",
      yahoo: "10-25/day",
    },
  },
  month: {
    daily: "50-100",
    weekly: "250-500",
    tip: "Gradually increase volume. Monitor bounce rates closely.",
    color: "destructive",
    providers: {
      gmail: "30-50/day",
      outlook: "40-60/day",
      yahoo: "25-50/day",
    },
  },
  quarter: {
    daily: "100-500",
    weekly: "500-2,500",
    tip: "Continue warming up. Maintain consistent sending patterns.",
    color: "warning",
    providers: {
      gmail: "75-200/day",
      outlook: "100-300/day",
      yahoo: "50-200/day",
    },
  },
  half: {
    daily: "500-1,000",
    weekly: "2,500-5,000",
    tip: "Domain is maturing. Avoid sudden volume spikes.",
    color: "warning",
    providers: {
      gmail: "300-600/day",
      outlook: "400-800/day",
      yahoo: "250-500/day",
    },
  },
  year: {
    daily: "1,000-5,000",
    weekly: "5,000-25,000",
    tip: "Good reputation building. Can handle moderate campaigns.",
    color: "info",
    providers: {
      gmail: "800-2,500/day",
      outlook: "1,000-3,500/day",
      yahoo: "600-2,000/day",
    },
  },
  established: {
    daily: "5,000-10,000",
    weekly: "25,000-50,000",
    tip: "Well-established. Focus on maintaining engagement rates.",
    color: "success",
    providers: {
      gmail: "3,000-6,000/day",
      outlook: "4,000-8,000/day",
      yahoo: "2,500-5,000/day",
    },
  },
  mature: {
    daily: "10,000+",
    weekly: "50,000+",
    tip: "Maximum sending capacity. Continue monitoring metrics.",
    color: "success",
    providers: {
      gmail: "8,000+/day",
      outlook: "10,000+/day",
      yahoo: "6,000+/day",
    },
  },
};

// Common DKIM selectors used by various email providers
const COMMON_DKIM_SELECTORS = [
  { value: "google", label: "google", provider: "Google Workspace" },
  { value: "selector1", label: "selector1", provider: "Microsoft 365" },
  { value: "selector2", label: "selector2", provider: "Microsoft 365" },
  { value: "default", label: "default", provider: "Generic" },
  { value: "k1", label: "k1", provider: "Mailchimp" },
  { value: "k2", label: "k2", provider: "Mailchimp" },
  { value: "k3", label: "k3", provider: "Mailchimp" },
  { value: "s1", label: "s1", provider: "SendGrid" },
  { value: "s2", label: "s2", provider: "SendGrid" },
  { value: "smtpapi", label: "smtpapi", provider: "SendGrid" },
  { value: "m1", label: "m1", provider: "Mailgun" },
  { value: "mx", label: "mx", provider: "Mailgun" },
  { value: "dkim", label: "dkim", provider: "Generic" },
  { value: "mail", label: "mail", provider: "Generic" },
  { value: "email", label: "email", provider: "Generic" },
  { value: "postmark1", label: "postmark1", provider: "Postmark" },
  { value: "postmark2", label: "postmark2", provider: "Postmark" },
  { value: "cm", label: "cm", provider: "Campaign Monitor" },
  { value: "zendesk1", label: "zendesk1", provider: "Zendesk" },
  { value: "zendesk2", label: "zendesk2", provider: "Zendesk" },
];

interface StepDomainProps {
  domain: string;
  setDomain: (value: string) => void;
  domainAge: string;
  setDomainAge: (value: string) => void;
  dkimSelector: string;
  setDkimSelector: (value: string) => void;
  onNext: () => void;
}

const StepDomain = ({
  domain,
  setDomain,
  domainAge,
  setDomainAge,
  dkimSelector,
  setDkimSelector,
  onNext,
}: StepDomainProps) => {
  const [selectedSelectors, setSelectedSelectors] = useState<string[]>(
    dkimSelector ? dkimSelector.split(",") : ["google"]
  );
  const [customSelector, setCustomSelector] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const isValid = domain.trim().length > 0 && domain.includes(".") && domainAge !== "";

  const handleSelectorToggle = (selector: string, checked: boolean) => {
    let newSelectors: string[];
    if (checked) {
      newSelectors = [...selectedSelectors, selector];
    } else {
      newSelectors = selectedSelectors.filter((s) => s !== selector);
    }
    setSelectedSelectors(newSelectors);
    setDkimSelector(newSelectors.join(","));
  };

  const handleAddCustomSelector = () => {
    if (customSelector.trim() && !selectedSelectors.includes(customSelector.trim())) {
      const newSelectors = [...selectedSelectors, customSelector.trim()];
      setSelectedSelectors(newSelectors);
      setDkimSelector(newSelectors.join(","));
      setCustomSelector("");
      setShowCustomInput(false);
    }
  };

  const handleRemoveSelector = (selector: string) => {
    const newSelectors = selectedSelectors.filter((s) => s !== selector);
    setSelectedSelectors(newSelectors);
    setDkimSelector(newSelectors.join(","));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Step 1: Domain Details
        </CardTitle>
        <CardDescription>
          Enter your sending domain information for DNS authentication verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="domain">Sending Domain *</Label>
          <Input
            id="domain"
            placeholder="e.g., mail.yourdomain.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            This is the domain from which you'll be sending emails
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="domainAge">Domain Age *</Label>
          <TooltipProvider delayDuration={200}>
            <Select value={domainAge} onValueChange={setDomainAge}>
              <SelectTrigger>
                <SelectValue placeholder="Select domain age (required)" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectItem value="new">
                      <span className="flex items-center gap-2">
                        Less than 2 weeks
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-destructive/15 text-destructive">High Risk</span>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </span>
                    </SelectItem>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[250px]">
                    <p>Brand new domains have no sending history. ISPs view them with suspicion as spammers often use fresh domains.</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectItem value="month">
                      <span className="flex items-center gap-2">
                        2 weeks - 1 month
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-destructive/15 text-destructive">High Risk</span>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </span>
                    </SelectItem>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[250px]">
                    <p>Still in the critical warmup phase. Sending volume should be kept very low to build reputation.</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectItem value="quarter">
                      <span className="flex items-center gap-2">
                        1 - 3 months
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]">Medium Risk</span>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </span>
                    </SelectItem>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[250px]">
                    <p>Building reputation but still vulnerable. Consistent sending patterns and good engagement are crucial.</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectItem value="half">
                      <span className="flex items-center gap-2">
                        3 - 6 months
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]">Medium Risk</span>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </span>
                    </SelectItem>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[250px]">
                    <p>Domain is maturing. Can handle moderate volumes but sudden spikes may still trigger filters.</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectItem value="year">
                      <span className="flex items-center gap-2">
                        6 months - 1 year
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-[hsl(var(--info))]/15 text-[hsl(var(--info))]">Low Risk</span>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </span>
                    </SelectItem>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[250px]">
                    <p>Established sending history. ISPs have enough data to assess reputation reliably.</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectItem value="established">
                      <span className="flex items-center gap-2">
                        1 - 2 years
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]">Trusted</span>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </span>
                    </SelectItem>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[250px]">
                    <p>Well-established domain with proven track record. Enjoys higher sending limits and better inbox placement.</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectItem value="mature">
                      <span className="flex items-center gap-2">
                        2+ years
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]">Trusted</span>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </span>
                    </SelectItem>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[250px]">
                    <p>Mature domain with excellent reputation history. Maximum trust from ISPs and highest deliverability potential.</p>
                  </TooltipContent>
                </Tooltip>
              </SelectContent>
            </Select>
          </TooltipProvider>
          <p className="text-xs text-muted-foreground">
            Newer domains have higher spam risk and need careful warming up
          </p>

          {/* Domain warmup progress bar */}
          {domainAge && WARMUP_PERCENTAGE[domainAge] && (
            <div className="p-4 rounded-lg border bg-accent/30 border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className={`w-4 h-4 ${
                    WARMUP_PERCENTAGE[domainAge].percent < 30 
                      ? "text-destructive" 
                      : WARMUP_PERCENTAGE[domainAge].percent < 60
                      ? "text-[hsl(var(--warning))]"
                      : "text-[hsl(var(--success))]"
                  }`} />
                  <span className="font-medium text-foreground text-sm">Domain Warmup Status</span>
                </div>
                <span className={`text-sm font-semibold ${
                  WARMUP_PERCENTAGE[domainAge].percent < 30 
                    ? "text-destructive" 
                    : WARMUP_PERCENTAGE[domainAge].percent < 60
                    ? "text-[hsl(var(--warning))]"
                    : "text-[hsl(var(--success))]"
                }`}>
                  {WARMUP_PERCENTAGE[domainAge].percent}%
                </span>
              </div>
              <Progress 
                value={WARMUP_PERCENTAGE[domainAge].percent} 
                className={`h-3 ${
                  WARMUP_PERCENTAGE[domainAge].percent < 30 
                    ? "[&>div]:bg-destructive" 
                    : WARMUP_PERCENTAGE[domainAge].percent < 60
                    ? "[&>div]:bg-[hsl(var(--warning))]"
                    : "[&>div]:bg-[hsl(var(--success))]"
                }`}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {WARMUP_PERCENTAGE[domainAge].label} — {WARMUP_PERCENTAGE[domainAge].percent < 100 
                  ? "Continue consistent sending to improve warmup" 
                  : "Maximum warmup achieved"}
              </p>
            </div>
          )}

          {/* Volume recommendations based on domain age */}
          {domainAge && VOLUME_RECOMMENDATIONS[domainAge] && (
            <div className={`p-4 rounded-lg border ${
              VOLUME_RECOMMENDATIONS[domainAge].color === "destructive" 
                ? "bg-destructive/10 border-destructive/30" 
                : VOLUME_RECOMMENDATIONS[domainAge].color === "warning"
                ? "bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/30"
                : VOLUME_RECOMMENDATIONS[domainAge].color === "info"
                ? "bg-[hsl(var(--info))]/10 border-[hsl(var(--info))]/30"
                : "bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/30"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className={`w-4 h-4 ${
                  VOLUME_RECOMMENDATIONS[domainAge].color === "destructive" 
                    ? "text-destructive" 
                    : VOLUME_RECOMMENDATIONS[domainAge].color === "warning"
                    ? "text-[hsl(var(--warning))]"
                    : VOLUME_RECOMMENDATIONS[domainAge].color === "info"
                    ? "text-[hsl(var(--info))]"
                    : "text-[hsl(var(--success))]"
                }`} />
                <span className="font-medium text-foreground text-sm">Recommended Sending Limits</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Daily Volume</p>
                  <p className="text-lg font-semibold text-foreground">{VOLUME_RECOMMENDATIONS[domainAge].daily}</p>
                  <p className="text-xs text-muted-foreground">emails/day</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Weekly Volume</p>
                  <p className="text-lg font-semibold text-foreground">{VOLUME_RECOMMENDATIONS[domainAge].weekly}</p>
                  <p className="text-xs text-muted-foreground">emails/week</p>
                </div>
              </div>
              
              {/* Provider-specific recommendations */}
              <div className="mb-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Provider-Specific Limits</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-md bg-background/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-0.5">Gmail</p>
                    <p className="text-sm font-semibold text-foreground">{VOLUME_RECOMMENDATIONS[domainAge].providers.gmail}</p>
                  </div>
                  <div className="p-2 rounded-md bg-background/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-0.5">Outlook</p>
                    <p className="text-sm font-semibold text-foreground">{VOLUME_RECOMMENDATIONS[domainAge].providers.outlook}</p>
                  </div>
                  <div className="p-2 rounded-md bg-background/50 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-0.5">Yahoo</p>
                    <p className="text-sm font-semibold text-foreground">{VOLUME_RECOMMENDATIONS[domainAge].providers.yahoo}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2 pt-2 border-t border-border/50">
                <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{VOLUME_RECOMMENDATIONS[domainAge].tip}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>DKIM Selectors *</Label>
          <p className="text-xs text-muted-foreground">
            Select all DKIM selectors used by your domain. Many domains use multiple selectors for different email services.
          </p>
          
          {/* Selected selectors display */}
          {selectedSelectors.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-accent/30 border border-border">
              {selectedSelectors.map((selector) => (
                <div
                  key={selector}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-sm"
                >
                  <Key className="w-3 h-3" />
                  {selector}
                  <button
                    onClick={() => handleRemoveSelector(selector)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Common selectors grid */}
          <div className="grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto p-1">
            {COMMON_DKIM_SELECTORS.map((item) => (
              <div
                key={item.value}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  id={`dkim-${item.value}`}
                  checked={selectedSelectors.includes(item.value)}
                  onCheckedChange={(checked) =>
                    handleSelectorToggle(item.value, checked === true)
                  }
                />
                <label
                  htmlFor={`dkim-${item.value}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="text-muted-foreground ml-1">({item.provider})</span>
                </label>
              </div>
            ))}
          </div>

          {/* Custom selector input */}
          {showCustomInput ? (
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom selector"
                value={customSelector}
                onChange={(e) => setCustomSelector(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustomSelector()}
              />
              <Button variant="outline" size="sm" onClick={handleAddCustomSelector}>
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomSelector("");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomInput(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Selector
            </Button>
          )}
        </div>

        <div className="p-4 rounded-lg bg-accent/50 border border-border">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            What we'll verify
          </h4>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              SPF Record
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Key className="w-4 h-4" />
              DKIM Records ({selectedSelectors.length} selector{selectedSelectors.length !== 1 ? "s" : ""})
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              DMARC Policy
            </div>
          </div>
        </div>

        <Button
          onClick={onNext}
          disabled={!isValid || selectedSelectors.length === 0}
          className="w-full"
        >
          Next: IP & SMTP Configuration
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default StepDomain;
