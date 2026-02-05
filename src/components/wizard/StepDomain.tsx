import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Globe, ArrowRight, Shield, Lock, Key, Plus, X, Info } from "lucide-react";
import DomainWarmupProgress from "./DomainWarmupProgress";
import VolumeRecommendations from "./VolumeRecommendations";

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

          {domainAge && (
            <DomainWarmupProgress domainAge={domainAge} />
          )}

          {domainAge && (
            <VolumeRecommendations domainAge={domainAge} />
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
