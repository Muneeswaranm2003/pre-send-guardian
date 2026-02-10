import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type WarmupDailyLog = Tables<"warmup_daily_logs">;

interface Props {
  logs: WarmupDailyLog[];
}

export default function WarmupBounceChart({ logs }: Props) {
  const data = logs
    .filter((l) => l.bounce_rate != null || l.complaint_rate != null)
    .map((l) => ({
      day: l.day_number,
      bounceRate: l.bounce_rate ? Number(l.bounce_rate) : 0,
      complaintRate: l.complaint_rate ? Number(l.complaint_rate) : 0,
    }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))]" />
            Bounce & Complaint Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-8">
            No rate data logged yet. Rates will appear here as you log daily volumes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))]" />
          Bounce & Complaint Rates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
              unit="%"
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 12,
                color: "hsl(var(--foreground))",
              }}
              formatter={(v: number, name: string) => [
                `${v}%`,
                name === "bounceRate" ? "Bounce" : "Complaint",
              ]}
              labelFormatter={(day) => `Day ${day}`}
            />
            <ReferenceLine y={2} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: "2% limit", fontSize: 10, fill: "hsl(var(--destructive))" }} />
            <Bar dataKey="bounceRate" fill="hsl(var(--chart-4))" radius={[3, 3, 0, 0]} maxBarSize={20} />
            <Bar dataKey="complaintRate" fill="hsl(var(--chart-3))" radius={[3, 3, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(var(--chart-4))" }} />
            Bounce
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(var(--chart-3))" }} />
            Complaint
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
