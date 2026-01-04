import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WizardSteps from "@/components/wizard/WizardSteps";
import StepDomain from "@/components/wizard/StepDomain";
import StepIpSmtp from "@/components/wizard/StepIpSmtp";
import StepEmailContent from "@/components/wizard/StepEmailContent";
import StepVerify from "@/components/wizard/StepVerify";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Domain", description: "Enter domain details" },
  { id: 2, title: "IP & SMTP", description: "Configure server" },
  { id: 3, title: "Email", description: "Add content" },
  { id: 4, title: "Verify", description: "Run simulation" },
];

const Simulator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Domain
  const [domain, setDomain] = useState("");
  const [domainAge, setDomainAge] = useState("new");
  const [dkimSelector, setDkimSelector] = useState("google");

  // Step 2: IP & SMTP
  const [connectionMethod, setConnectionMethod] = useState<"ip" | "smtp" | "api">("ip");
  const [ipAddress, setIpAddress] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiProvider, setApiProvider] = useState("sendgrid");
  const [volume, setVolume] = useState([1000]);

  // Step 3: Email Content
  const [subject, setSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");

  const handleSaveToMonitoring = async (alertEmail: string) => {
    if (!user) {
      toast.error("Please sign in to add domains to monitoring");
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase.from("monitored_domains").insert({
        user_id: user.id,
        domain,
        ip_address: ipAddress || null,
        smtp_host: smtpHost || null,
        smtp_port: smtpPort,
        dkim_selector: dkimSelector,
        alert_email: alertEmail || null,
      });

      if (error) throw error;

      toast.success("Domain added to monitoring!");
    } catch (error) {
      console.error("Error saving domain:", error);
      toast.error("Failed to save domain");
      throw error;
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setDomain("");
    setDomainAge("new");
    setDkimSelector("google");
    setConnectionMethod("ip");
    setIpAddress("");
    setSmtpHost("");
    setSmtpPort(587);
    setSmtpUsername("");
    setSmtpPassword("");
    setApiKey("");
    setApiProvider("sendgrid");
    setVolume([1000]);
    setSubject("");
    setEmailContent("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Email Spam Risk Simulator
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow the steps to analyze your email campaign before sending
            </p>
          </div>

          {/* Wizard Steps */}
          <WizardSteps steps={steps} currentStep={currentStep} />

          {/* Step Content */}
          {currentStep === 1 && (
            <StepDomain
              domain={domain}
              setDomain={setDomain}
              domainAge={domainAge}
              setDomainAge={setDomainAge}
              dkimSelector={dkimSelector}
              setDkimSelector={setDkimSelector}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <StepIpSmtp
              connectionMethod={connectionMethod}
              setConnectionMethod={setConnectionMethod}
              ipAddress={ipAddress}
              setIpAddress={setIpAddress}
              smtpHost={smtpHost}
              setSmtpHost={setSmtpHost}
              smtpPort={smtpPort}
              setSmtpPort={setSmtpPort}
              smtpUsername={smtpUsername}
              setSmtpUsername={setSmtpUsername}
              smtpPassword={smtpPassword}
              setSmtpPassword={setSmtpPassword}
              apiKey={apiKey}
              setApiKey={setApiKey}
              apiProvider={apiProvider}
              setApiProvider={setApiProvider}
              volume={volume}
              setVolume={setVolume}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <StepEmailContent
              subject={subject}
              setSubject={setSubject}
              emailContent={emailContent}
              setEmailContent={setEmailContent}
              onBack={() => setCurrentStep(2)}
              onNext={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 4 && (
            <StepVerify
              domain={domain}
              domainAge={domainAge}
              dkimSelector={dkimSelector}
              ipAddress={ipAddress}
              smtpHost={smtpHost}
              smtpPort={smtpPort}
              volume={volume}
              subject={subject}
              emailContent={emailContent}
              onBack={() => setCurrentStep(3)}
              onSaveToMonitoring={user ? handleSaveToMonitoring : undefined}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Simulator;
