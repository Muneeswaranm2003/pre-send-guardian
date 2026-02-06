import { memo } from "react";
import { Calendar, TrendingUp, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WarmupWeek {
  week: number;
  daily: string;
  increase: string;
  milestone: string;
}

const WARMUP_SCHEDULES: Record<string, { label: string; weeks: WarmupWeek[] }> = {
  new: {
    label: "Starting from scratch",
    weeks: [
      { week: 1, daily: "10–20", increase: "—", milestone: "Send to known engaged contacts only" },
      { week: 2, daily: "20–40", increase: "+100%", milestone: "Monitor bounces < 2%" },
      { week: 3, daily: "40–80", increase: "+100%", milestone: "Check spam complaint rate < 0.1%" },
      { week: 4, daily: "80–150", increase: "+90%", milestone: "Review inbox placement rates" },
      { week: 6, daily: "150–300", increase: "+100%", milestone: "Expand to less engaged segments" },
      { week: 8, daily: "300–500", increase: "+65%", milestone: "Stabilize sending patterns" },
    ],
  },
  month: {
    label: "Early warmup phase",
    weeks: [
      { week: 1, daily: "50–100", increase: "—", milestone: "Maintain current engagement" },
      { week: 2, daily: "100–200", increase: "+100%", milestone: "Keep bounce rate under 2%" },
      { week: 3, daily: "200–400", increase: "+100%", milestone: "Add secondary segments" },
      { week: 4, daily: "400–700", increase: "+75%", milestone: "Monitor delivery across providers" },
      { week: 6, daily: "700–1,000", increase: "+45%", milestone: "Stabilize at target volume" },
    ],
  },
  quarter: {
    label: "Building reputation",
    weeks: [
      { week: 1, daily: "200–400", increase: "—", milestone: "Baseline established" },
      { week: 2, daily: "400–800", increase: "+100%", milestone: "Expand recipient pool" },
      { week: 3, daily: "800–1,500", increase: "+90%", milestone: "Test larger campaigns" },
      { week: 4, daily: "1,500–2,500", increase: "+65%", milestone: "Approaching mature volume" },
    ],
  },
  half: {
    label: "Scaling up",
    weeks: [
      { week: 1, daily: "500–1,000", increase: "—", milestone: "Consistent sending base" },
      { week: 2, daily: "1,000–2,000", increase: "+100%", milestone: "Scale confidently" },
      { week: 3, daily: "2,000–3,500", increase: "+75%", milestone: "Monitor engagement metrics" },
      { week: 4, daily: "3,500–5,000", increase: "+40%", milestone: "Near full capacity" },
    ],
  },
  year: {
    label: "Moderate increases",
    weeks: [
      { week: 1, daily: "1,000–2,500", increase: "—", milestone: "Strong sending history" },
      { week: 2, daily: "2,500–5,000", increase: "+100%", milestone: "Scale with confidence" },
      { week: 3, daily: "5,000–8,000", increase: "+60%", milestone: "Full campaign volume" },
    ],
  },
  established: {
    label: "Fine-tuning",
    weeks: [
      { week: 1, daily: "5,000–8,000", increase: "—", milestone: "Trusted sender" },
      { week: 2, daily: "8,000–12,000", increase: "+50%", milestone: "Scale freely" },
    ],
  },
  mature: {
    label: "At capacity",
    weeks: [
      { week: 1, daily: "10,000+", increase: "—", milestone: "Full capacity — focus on engagement" },
    ],
  },
};

interface WarmupScheduleCalculatorProps {
  domainAge: string;
}

function WarmupScheduleCalculator({ domainAge }: WarmupScheduleCalculatorProps) {
  const schedule = WARMUP_SCHEDULES[domainAge];
  if (!schedule) return null;

  return (
    <div className="p-4 rounded-lg border border-border bg-accent/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground text-sm">Warmup Schedule</span>
        </div>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                {schedule.label}
                <Info className="w-3 h-3" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px]">
              <p>Follow this schedule to safely increase sending volume without triggering spam filters. Pause or reduce if bounce rates exceed 2%.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-0">
        {schedule.weeks.map((week, i) => (
          <div key={week.week} className="flex items-stretch gap-3">
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center w-5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-primary-foreground shrink-0 mt-3" />
              {i < schedule.weeks.length - 1 && (
                <div className="w-px flex-1 bg-border" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-3">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Week {week.week}
                </span>
                {week.increase !== "—" && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {week.increase}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-foreground">{week.daily} emails/day</p>
              <p className="text-xs text-muted-foreground">{week.milestone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(WarmupScheduleCalculator);
