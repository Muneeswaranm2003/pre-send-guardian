import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Flame, Plus, Mail } from "lucide-react";

interface WarmupPlanCreatorProps {
  onCreatePlan: (plan: {
    domain: string;
    domainAge: string;
    targetDailyVolume: number;
    alertEmail?: string;
    alertsEnabled?: boolean;
  }) => Promise<unknown>;
}

const DOMAIN_AGES = [
  { value: "new", label: "Less than 2 weeks" },
  { value: "month", label: "2 weeks – 1 month" },
  { value: "quarter", label: "1 – 3 months" },
  { value: "half", label: "3 – 6 months" },
  { value: "year", label: "6 months – 1 year" },
  { value: "established", label: "1 – 2 years" },
  { value: "mature", label: "2+ years" },
];

export default function WarmupPlanCreator({ onCreatePlan }: WarmupPlanCreatorProps) {
  const [domain, setDomain] = useState("");
  const [domainAge, setDomainAge] = useState("");
  const [targetVolume, setTargetVolume] = useState([5000]);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [creating, setCreating] = useState(false);

  const isValid = domain.includes(".") && domainAge !== "";

  const handleCreate = async () => {
    setCreating(true);
    await onCreatePlan({
      domain,
      domainAge,
      targetDailyVolume: targetVolume[0],
      alertEmail: alertsEnabled ? alertEmail : undefined,
      alertsEnabled,
    });
    setDomain("");
    setDomainAge("");
    setTargetVolume([5000]);
    setAlertEmail("");
    setAlertsEnabled(false);
    setCreating(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          Create Warmup Plan
        </CardTitle>
        <CardDescription>
          Set up a personalized warmup schedule for your domain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Domain *</Label>
            <Input
              placeholder="mail.yourdomain.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Domain Age *</Label>
            <Select value={domainAge} onValueChange={setDomainAge}>
              <SelectTrigger>
                <SelectValue placeholder="Select age" />
              </SelectTrigger>
              <SelectContent>
                {DOMAIN_AGES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Target Daily Volume</Label>
            <span className="text-sm font-medium text-primary">
              {targetVolume[0].toLocaleString()} emails/day
            </span>
          </div>
          <Slider
            value={targetVolume}
            onValueChange={setTargetVolume}
            min={100}
            max={50000}
            step={100}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100</span>
            <span>50,000</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-accent/30">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Email Alerts</p>
              <p className="text-xs text-muted-foreground">Get notified on milestones & issues</p>
            </div>
          </div>
          <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
        </div>

        {alertsEnabled && (
          <div className="space-y-2">
            <Label>Alert Email</Label>
            <Input
              type="email"
              placeholder="alerts@yourdomain.com"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
            />
          </div>
        )}

        <Button
          onClick={handleCreate}
          disabled={!isValid || creating}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          {creating ? "Creating…" : "Create Warmup Plan"}
        </Button>
      </CardContent>
    </Card>
  );
}
