import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { toast } from "sonner";
import AdvisorResults, { type DeliverabilityAdvice } from "@/components/advisor/AdvisorResults";

const domainAges = [
  "Less than 2 weeks",
  "2-4 weeks",
  "1-3 months",
  "3-12 months",
  "1-2 years",
  "Over 2 years",
];

const authOptions = [
  "SPF, DKIM and DMARC all set up",
  "SPF and DKIM only (no DMARC)",
  "SPF only",
  "Nothing set up yet",
  "Not sure",
];

const audienceSources = [
  "Double opt-in sign-ups",
  "Single opt-in sign-ups",
  "Customers who bought from us",
  "Imported or purchased list",
  "Mixed sources",
];

const Advisor = () => {
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [body, setBody] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromDomain, setFromDomain] = useState("");
  const [domainAge, setDomainAge] = useState(domainAges[2]);
  const [authStatus, setAuthStatus] = useState(authOptions[0]);
  const [audienceSource, setAudienceSource] = useState(audienceSources[0]);
  const [monthlyVolume, setMonthlyVolume] = useState("");
  const [bounceRate, setBounceRate] = useState("");
  const [complaintRate, setComplaintRate] = useState("");
  const [openRate, setOpenRate] = useState("");
  const [blacklisted, setBlacklisted] = useState("Not listed anywhere");
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<DeliverabilityAdvice | null>(null);

  const handleAnalyze = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Add a subject line and the email text first");
      return;
    }

    setLoading(true);
    setAdvice(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-deliverability", {
        body: {
          subject,
          preheader,
          body,
          fromName,
          fromDomain,
          domainAge,
          authStatus,
          audienceSource,
          monthlyVolume,
          bounceRate,
          complaintRate,
          openRate,
          blacklisted,
        },
      });

      if (error) {
        const details =
          error instanceof FunctionsHttpError ? await error.context.text() : error.message;
        console.error("analyze-deliverability failed:", details);
        toast.error("The review could not be completed. Please try again in a moment.");
        return;
      }

      setAdvice(data as DeliverabilityAdvice);
      toast.success("Review ready");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while reviewing this email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 space-y-8">
        <PageHeader
          title="Deliverability Review"
          description="Paste your email and your sending details. You'll get a plain-language explanation of what could push it to spam, and exactly what to fix."
          icon={Sparkles}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 space-y-5 min-w-0">
            <h2 className="text-lg font-semibold">Email content</h2>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject line</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your October invoice is ready"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preheader">Preview text (optional)</Label>
              <Input
                id="preheader"
                value={preheader}
                onChange={(e) => setPreheader(e.target.value)}
                placeholder="A short line shown next to the subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email text</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                placeholder="Paste the full email here, including links and the sign-off."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fromName">From name</Label>
                <Input
                  id="fromName"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Acme Billing"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromDomain">Sending domain</Label>
                <Input
                  id="fromDomain"
                  value={fromDomain}
                  onChange={(e) => setFromDomain(e.target.value)}
                  placeholder="mail.acme.com"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-5 min-w-0">
            <h2 className="text-lg font-semibold">Sender reputation</h2>

            <div className="space-y-2">
              <Label>Domain age</Label>
              <Select value={domainAge} onValueChange={setDomainAge}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {domainAges.map((age) => (
                    <SelectItem key={age} value={age}>
                      {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Domain setup (SPF, DKIM, DMARC)</Label>
              <Select value={authStatus} onValueChange={setAuthStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {authOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>How you collected these contacts</Label>
              <Select value={audienceSource} onValueChange={setAudienceSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audienceSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Blacklist status</Label>
              <Select value={blacklisted} onValueChange={setBlacklisted}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not listed anywhere">Not listed anywhere</SelectItem>
                  <SelectItem value="Listed on Spamhaus">Listed on Spamhaus</SelectItem>
                  <SelectItem value="Listed on another blocklist">
                    Listed on another blocklist
                  </SelectItem>
                  <SelectItem value="Not sure">Not sure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="volume">Emails per month</Label>
                <Input
                  id="volume"
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(e.target.value)}
                  placeholder="50,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bounce">Bounce rate %</Label>
                <Input
                  id="bounce"
                  value={bounceRate}
                  onChange={(e) => setBounceRate(e.target.value)}
                  placeholder="1.2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complaint">Spam complaint rate %</Label>
                <Input
                  id="complaint"
                  value={complaintRate}
                  onChange={(e) => setComplaintRate(e.target.value)}
                  placeholder="0.05"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="open">Open rate %</Label>
                <Input
                  id="open"
                  value={openRate}
                  onChange={(e) => setOpenRate(e.target.value)}
                  placeholder="24"
                />
              </div>
            </div>

            <Button
              variant="hero"
              className="w-full"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reviewing your email…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Review my email
                </>
              )}
            </Button>
          </Card>
        </div>

        {advice && <AdvisorResults advice={advice} />}
      </main>
      <Footer />
    </div>
  );
};

export default Advisor;
