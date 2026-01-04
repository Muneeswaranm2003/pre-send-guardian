import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Server, ArrowRight, ArrowLeft, AlertCircle, Lock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StepIpSmtpProps {
  ipAddress: string;
  setIpAddress: (value: string) => void;
  smtpHost: string;
  setSmtpHost: (value: string) => void;
  smtpPort: number;
  setSmtpPort: (value: number) => void;
  smtpUsername: string;
  setSmtpUsername: (value: string) => void;
  smtpPassword: string;
  setSmtpPassword: (value: string) => void;
  volume: number[];
  setVolume: (value: number[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const StepIpSmtp = ({
  ipAddress,
  setIpAddress,
  smtpHost,
  setSmtpHost,
  smtpPort,
  setSmtpPort,
  smtpUsername,
  setSmtpUsername,
  smtpPassword,
  setSmtpPassword,
  volume,
  setVolume,
  onBack,
  onNext,
}: StepIpSmtpProps) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const canTest = smtpHost && smtpPort && smtpUsername && smtpPassword;

  const testConnection = async () => {
    if (!canTest) {
      toast.error("Please fill in all SMTP fields first");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-smtp', {
        body: {
          host: smtpHost,
          port: smtpPort,
          username: smtpUsername,
          password: smtpPassword,
        },
      });

      if (error) throw error;

      setTestResult({
        success: data.success,
        message: data.success ? data.message : data.error,
        details: data.details,
      });

      if (data.success) {
        toast.success("SMTP connection successful!");
      } else {
        toast.error(data.error || "Connection failed");
      }
    } catch (error) {
      console.error("SMTP test error:", error);
      setTestResult({
        success: false,
        message: "Failed to test SMTP connection",
        details: error instanceof Error ? error.message : String(error),
      });
      toast.error("Failed to test connection");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          Step 2: IP & SMTP Configuration
        </CardTitle>
        <CardDescription>
          Configure your sending IP and SMTP server details for blacklist monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ipAddress">Sending IP Address</Label>
            <Input
              id="ipAddress"
              placeholder="e.g., 192.168.1.1"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your outbound email server IP
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtpHost">SMTP Host *</Label>
            <Input
              id="smtpHost"
              placeholder="e.g., smtp.yourdomain.com"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="smtpPort">SMTP Port *</Label>
            <Input
              id="smtpPort"
              type="number"
              placeholder="587"
              value={smtpPort}
              onChange={(e) => setSmtpPort(parseInt(e.target.value) || 587)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Common: 25, 587, 465
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtpUsername">SMTP Username *</Label>
            <Input
              id="smtpUsername"
              placeholder="e.g., user@yourdomain.com"
              value={smtpUsername}
              onChange={(e) => setSmtpUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtpPassword" className="flex items-center gap-2">
            <Lock className="w-3 h-3" />
            SMTP Password *
          </Label>
          <Input
            id="smtpPassword"
            type="password"
            placeholder="Enter your SMTP password"
            value={smtpPassword}
            onChange={(e) => setSmtpPassword(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Your credentials are used only for connectivity testing and are never stored
          </p>
        </div>

        {/* Test Connection Button */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={testConnection}
            disabled={!canTest || isTesting}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Server className="w-4 h-4 mr-2" />
                Test SMTP Connection
              </>
            )}
          </Button>

          {testResult && (
            <div
              className={`p-3 rounded-lg flex items-start gap-2 ${
                testResult.success
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-destructive/10 border border-destructive/30"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    testResult.success ? "text-primary" : "text-destructive"
                  }`}
                >
                  {testResult.message}
                </p>
                {testResult.details && typeof testResult.details === "string" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {testResult.details}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Planned Send Volume</Label>
            <span className="text-sm font-medium text-primary">
              {volume[0].toLocaleString()} emails
            </span>
          </div>
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={10000}
            min={100}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100</span>
            <span>10,000</span>
          </div>
        </div>

        {volume[0] > 5000 && (
          <div className="p-3 rounded-lg bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/30 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[hsl(var(--warning))] mt-0.5" />
            <p className="text-sm text-muted-foreground">
              High volume detected. Consider splitting your campaign or warming up gradually.
            </p>
          </div>
        )}

        <div className="p-4 rounded-lg bg-accent/50 border border-border">
          <h4 className="font-medium text-foreground mb-2">Blacklist Monitoring</h4>
          <p className="text-sm text-muted-foreground">
            We'll check your IP against 10+ major blacklist providers including Spamhaus, 
            Barracuda, SpamCop, SORBS, and more.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={onNext} className="flex-1">
            Next: Email Content
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepIpSmtp;
