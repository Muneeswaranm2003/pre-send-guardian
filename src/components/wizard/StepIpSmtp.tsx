import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Server, ArrowRight, ArrowLeft, AlertCircle, Lock, CheckCircle2, XCircle, Loader2, Globe, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ConnectionMethod = "ip" | "smtp" | "api";

interface StepIpSmtpProps {
  connectionMethod: ConnectionMethod;
  setConnectionMethod: (value: ConnectionMethod) => void;
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
  apiKey: string;
  setApiKey: (value: string) => void;
  apiProvider: string;
  setApiProvider: (value: string) => void;
  volume: number[];
  setVolume: (value: number[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const StepIpSmtp = ({
  connectionMethod,
  setConnectionMethod,
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
  apiKey,
  setApiKey,
  apiProvider,
  setApiProvider,
  volume,
  setVolume,
  onBack,
  onNext,
}: StepIpSmtpProps) => {
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);
  const [apiTestResult, setApiTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  // Validation based on selected method
  const isMethodValid = () => {
    switch (connectionMethod) {
      case "ip":
        return ipAddress.trim() !== "";
      case "smtp":
        return smtpHost && smtpPort && smtpUsername && smtpPassword;
      case "api":
        return apiKey.trim() !== "" && apiProvider;
      default:
        return false;
    }
  };

  const canTestSmtp = connectionMethod === "smtp" && smtpHost && smtpPort && smtpUsername && smtpPassword;
  const canTestApi = connectionMethod === "api" && apiKey.trim() !== "" && apiProvider;

  const testSmtpConnection = async () => {
    if (!canTestSmtp) {
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

  const testApiKey = async () => {
    if (!canTestApi) {
      toast.error("Please select a provider and enter an API key");
      return;
    }

    setIsTestingApi(true);
    setApiTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-api-key', {
        body: {
          provider: apiProvider,
          apiKey: apiKey,
        },
      });

      if (error) throw error;

      setApiTestResult({
        success: data.success,
        message: data.message,
        details: data.details,
      });

      if (data.success) {
        toast.success("API key validated successfully!");
      } else {
        toast.error(data.message || "Validation failed");
      }
    } catch (error) {
      console.error("API key test error:", error);
      setApiTestResult({
        success: false,
        message: "Failed to validate API key",
        details: error instanceof Error ? error.message : String(error),
      });
      toast.error("Failed to validate API key");
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleNext = () => {
    if (!isMethodValid()) {
      toast.error("Please complete at least one connection method");
      return;
    }
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          Step 2: Server Configuration
        </CardTitle>
        <CardDescription>
          Choose one method to configure your email sending infrastructure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Method Selection */}
        <div className="space-y-3">
          <Label>Connection Method (choose one) *</Label>
          <RadioGroup
            value={connectionMethod}
            onValueChange={(value) => setConnectionMethod(value as ConnectionMethod)}
            className="grid gap-3"
          >
            <div
              className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                connectionMethod === "ip"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setConnectionMethod("ip")}
            >
              <RadioGroupItem value="ip" id="method-ip" />
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <Label htmlFor="method-ip" className="cursor-pointer font-medium">
                  IP Address Only
                </Label>
                <p className="text-xs text-muted-foreground">
                  Check blacklist status for your sending IP
                </p>
              </div>
            </div>

            <div
              className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                connectionMethod === "smtp"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setConnectionMethod("smtp")}
            >
              <RadioGroupItem value="smtp" id="method-smtp" />
              <Server className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <Label htmlFor="method-smtp" className="cursor-pointer font-medium">
                  SMTP Server
                </Label>
                <p className="text-xs text-muted-foreground">
                  Full SMTP configuration with connectivity test
                </p>
              </div>
            </div>

            <div
              className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                connectionMethod === "api"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setConnectionMethod("api")}
            >
              <RadioGroupItem value="api" id="method-api" />
              <Key className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <Label htmlFor="method-api" className="cursor-pointer font-medium">
                  API Key
                </Label>
                <p className="text-xs text-muted-foreground">
                  Use email service provider API (SendGrid, Mailgun, etc.)
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* IP Address Fields */}
        {connectionMethod === "ip" && (
          <div className="space-y-4 p-4 rounded-lg bg-accent/30 border border-border">
            <div className="space-y-2">
              <Label htmlFor="ipAddress">Sending IP Address *</Label>
              <Input
                id="ipAddress"
                placeholder="e.g., 192.168.1.1"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Your outbound email server IP address
              </p>
            </div>
          </div>
        )}

        {/* SMTP Fields */}
        {connectionMethod === "smtp" && (
          <div className="space-y-4 p-4 rounded-lg bg-accent/30 border border-border">
            <div className="grid gap-4 sm:grid-cols-2">
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

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port *</Label>
                <Select value={smtpPort.toString()} onValueChange={(value) => setSmtpPort(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select port" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 (Standard SMTP)</SelectItem>
                    <SelectItem value="465">465 (SSL/TLS)</SelectItem>
                    <SelectItem value="587">587 (STARTTLS - Recommended)</SelectItem>
                    <SelectItem value="2525">2525 (Alternative)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  587 is recommended for most providers
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Your credentials are used only for connectivity testing and are never stored
            </p>

            {/* Test Connection Button */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={testSmtpConnection}
                disabled={!canTestSmtp || isTesting}
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
          </div>
        )}

        {/* API Key Fields */}
        {connectionMethod === "api" && (
          <div className="space-y-4 p-4 rounded-lg bg-accent/30 border border-border">
            <div className="space-y-2">
              <Label htmlFor="apiProvider">Email Service Provider *</Label>
              <Select value={apiProvider} onValueChange={setApiProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="mailgun">Mailgun</SelectItem>
                  <SelectItem value="ses">Amazon SES</SelectItem>
                  <SelectItem value="postmark">Postmark</SelectItem>
                  <SelectItem value="sparkpost">SparkPost</SelectItem>
                  <SelectItem value="mailchimp">Mailchimp Transactional</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key className="w-3 h-3" />
                API Key *
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Your API key is used only for verification and is never stored
              </p>
            </div>

            {/* Test API Key Button */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={testApiKey}
                disabled={!canTestApi || isTestingApi}
                className="w-full"
              >
                {isTestingApi ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating API Key...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Validate API Key
                  </>
                )}
              </Button>

              {apiTestResult && (
                <div
                  className={`p-3 rounded-lg flex items-start gap-2 ${
                    apiTestResult.success
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-destructive/10 border border-destructive/30"
                  }`}
                >
                  {apiTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        apiTestResult.success ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {apiTestResult.message}
                    </p>
                    {apiTestResult.details && typeof apiTestResult.details === "string" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {apiTestResult.details}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
          <Button onClick={handleNext} disabled={!isMethodValid()} className="flex-1">
            Next: Email Content
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepIpSmtp;
