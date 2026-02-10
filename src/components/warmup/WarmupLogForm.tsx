import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, TrendingUp } from "lucide-react";

interface Props {
  currentDay: number;
  recommendedVolume: number;
  onLog: (actualVolume: number, bounceRate?: number, complaintRate?: number, notes?: string) => void;
}

export default function WarmupLogForm({ currentDay, recommendedVolume, onLog }: Props) {
  const [actualVolume, setActualVolume] = useState("");
  const [bounceRate, setBounceRate] = useState("");
  const [complaintRate, setComplaintRate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    const vol = parseInt(actualVolume) || recommendedVolume;
    const br = bounceRate ? parseFloat(bounceRate) : undefined;
    const cr = complaintRate ? parseFloat(complaintRate) : undefined;
    onLog(vol, br, cr, notes || undefined);
    setActualVolume("");
    setBounceRate("");
    setComplaintRate("");
    setNotes("");
  };

  return (
    <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Day {currentDay} — Log Your Send</span>
        </div>
        <span className="text-lg font-bold text-primary">
          {recommendedVolume.toLocaleString()} emails
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs">Actual Volume</Label>
          <Input
            type="number"
            placeholder={recommendedVolume.toString()}
            value={actualVolume}
            onChange={(e) => setActualVolume(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Bounce Rate %</Label>
          <Input
            type="number"
            step="0.1"
            placeholder="0.5"
            value={bounceRate}
            onChange={(e) => setBounceRate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Complaint Rate %</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.05"
            value={complaintRate}
            onChange={(e) => setComplaintRate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Notes (optional)</Label>
        <Textarea
          placeholder="Any observations about today's send..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-16 resize-none"
        />
      </div>

      {bounceRate && parseFloat(bounceRate) > 2 && (
        <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
          ⚠️ Bounce rate above 2% — consider pausing and reducing volume. Auto-pause may trigger.
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full">
        <CheckCircle className="w-4 h-4 mr-2" />
        Log Day {currentDay}
      </Button>
    </div>
  );
}
