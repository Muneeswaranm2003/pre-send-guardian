import { useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { SPAM_TRIGGER_WORDS } from "@/constants";

interface StepEmailContentProps {
  subject: string;
  setSubject: (value: string) => void;
  emailContent: string;
  setEmailContent: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

interface WarningAlertProps {
  title: string;
  description: string;
}

const WarningAlert = memo(function WarningAlert({ title, description }: WarningAlertProps) {
  return (
    <div className="p-3 rounded-lg bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/30 flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-[hsl(var(--warning))] mt-0.5 shrink-0" />
      <div className="text-sm">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
});

function StepEmailContent({
  subject,
  setSubject,
  emailContent,
  setEmailContent,
  onBack,
  onNext,
}: StepEmailContentProps) {
  const { foundSpamWords, linkCount } = useMemo(() => {
    const lowerContent = emailContent.toLowerCase();
    const lowerSubject = subject.toLowerCase();
    
    const found = SPAM_TRIGGER_WORDS.filter(
      (word) => lowerContent.includes(word) || lowerSubject.includes(word)
    );
    
    const links = (emailContent.match(/http/gi) || []).length;
    
    return { foundSpamWords: found, linkCount: links };
  }, [emailContent, subject]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Step 3: Email Content
        </CardTitle>
        <CardDescription>
          Enter your email subject and body for content analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            placeholder="Enter your email subject line"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Email Body</Label>
          <Tabs defaultValue="text">
            <TabsList className="mb-2">
              <TabsTrigger value="text">Plain Text</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <Textarea
                placeholder="Paste your email content here..."
                className="min-h-[200px] resize-none"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
            </TabsContent>
            <TabsContent value="html">
              <Textarea
                placeholder="Paste your HTML email template here..."
                className="min-h-[200px] resize-none font-mono text-sm"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Real-time warnings */}
        <div className="space-y-2">
          {foundSpamWords.length > 0 && (
            <WarningAlert
              title="Spam trigger words detected"
              description={`Found: ${foundSpamWords.join(", ")}`}
            />
          )}

          {linkCount > 5 && (
            <WarningAlert
              title="Too many links"
              description={`${linkCount} links found. Recommend keeping under 5.`}
            />
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={onNext} className="flex-1">
            Next: Verify & Simulate
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(StepEmailContent);
