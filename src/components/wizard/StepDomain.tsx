import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, ArrowRight, Shield, Lock, Key } from "lucide-react";

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
  const isValid = domain.trim().length > 0 && domain.includes(".");

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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="domainAge">Domain Age</Label>
            <Select value={domainAge} onValueChange={setDomainAge}>
              <SelectTrigger>
                <SelectValue placeholder="Select domain age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Less than 2 weeks</SelectItem>
                <SelectItem value="month">2 weeks - 1 month</SelectItem>
                <SelectItem value="quarter">1 - 3 months</SelectItem>
                <SelectItem value="established">3+ months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dkimSelector">DKIM Selector</Label>
            <Select value={dkimSelector} onValueChange={setDkimSelector}>
              <SelectTrigger>
                <SelectValue placeholder="Select DKIM selector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">google (Google Workspace)</SelectItem>
                <SelectItem value="selector1">selector1 (Microsoft 365)</SelectItem>
                <SelectItem value="selector2">selector2 (Microsoft 365)</SelectItem>
                <SelectItem value="default">default</SelectItem>
                <SelectItem value="k1">k1 (Mailchimp)</SelectItem>
                <SelectItem value="s1">s1 (SendGrid)</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              DKIM Record
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              DMARC Policy
            </div>
          </div>
        </div>

        <Button
          onClick={onNext}
          disabled={!isValid}
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
