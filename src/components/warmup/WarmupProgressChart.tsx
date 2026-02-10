import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { generateSchedule } from "@/hooks/useWarmupPlans";
import type { Tables } from "@/integrations/supabase/types";

type WarmupDailyLog = Tables<"warmup_daily_logs">;

interface Props {
  domainAge: string;
  targetVolume: number;
  logs: WarmupDailyLog[];
  currentDay: number;
}

export default function WarmupProgressChart({ domainAge, targetVolume, logs, currentDay }: Props) {
  const schedule = generateSchedule(domainAge, targetVolume);

  const data = schedule.map((s) => {
    const log = logs.find((l) => l.day_number === s.day);
    return {
      day: s.day,
      recommended: s.volume,
      actual: log?.actual_volume ?? null,
      bounceRate: log?.bounce_rate ? Number(log.bounce_rate) : null,
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Volume Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRecommended" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 12,
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number, name: string) => [
                value?.toLocaleString() ?? "—",
                name === "recommended" ? "Target" : "Actual",
              ]}
              labelFormatter={(day) => `Day ${day}`}
            />
            <Area
              type="monotone"
              dataKey="recommended"
              stroke="hsl(var(--chart-1))"
              fill="url(#gradRecommended)"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--chart-2))"
              fill="url(#gradActual)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            {currentDay <= 42 && (
              <ReferenceLine
                x={currentDay}
                stroke="hsl(var(--primary))"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: "hsl(var(--chart-1))" }} />
            Target
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5" style={{ background: "hsl(var(--chart-2))" }} />
            Actual
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
