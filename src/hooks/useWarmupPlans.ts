import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type WarmupPlan = Tables<"warmup_plans">;
type WarmupDailyLog = Tables<"warmup_daily_logs">;

// Generate recommended volume for a given day based on domain age
export function getRecommendedVolume(domainAge: string, day: number, targetVolume: number): number {
  // Starting volumes by domain age
  const startVolumes: Record<string, number> = {
    new: 15, month: 75, quarter: 300, half: 750,
    year: 1750, established: 6500, mature: 10000,
  };
  const start = startVolumes[domainAge] ?? 100;
  if (start >= targetVolume) return targetVolume;

  // Exponential growth curve to reach target in ~42 days (6 weeks)
  const growthRate = Math.log(targetVolume / start) / 42;
  const volume = Math.round(start * Math.exp(growthRate * (day - 1)));
  return Math.min(volume, targetVolume);
}

export function generateSchedule(domainAge: string, targetVolume: number, totalDays = 42) {
  const schedule: { day: number; volume: number }[] = [];
  for (let d = 1; d <= totalDays; d++) {
    schedule.push({ day: d, volume: getRecommendedVolume(domainAge, d, targetVolume) });
  }
  return schedule;
}

export function useWarmupPlans(userId: string | undefined) {
  const [plans, setPlans] = useState<WarmupPlan[]>([]);
  const [logs, setLogs] = useState<Record<string, WarmupDailyLog[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("warmup_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load warmup plans");
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  }, [userId]);

  const fetchLogs = useCallback(async (planId: string) => {
    const { data, error } = await supabase
      .from("warmup_daily_logs")
      .select("*")
      .eq("plan_id", planId)
      .order("day_number", { ascending: true });

    if (!error && data) {
      setLogs((prev) => ({ ...prev, [planId]: data }));
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = useCallback(
    async (plan: {
      domain: string;
      domainAge: string;
      targetDailyVolume: number;
      alertEmail?: string;
      alertsEnabled?: boolean;
    }) => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("warmup_plans")
        .insert({
          user_id: userId,
          domain: plan.domain,
          domain_age: plan.domainAge,
          target_daily_volume: plan.targetDailyVolume,
          alert_email: plan.alertEmail || null,
          alerts_enabled: plan.alertsEnabled || false,
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to create warmup plan");
        return null;
      }
      toast.success("Warmup plan created!");
      await fetchPlans();
      return data;
    },
    [userId, fetchPlans]
  );

  const updatePlanStatus = useCallback(
    async (planId: string, status: "active" | "paused" | "completed") => {
      const { error } = await supabase
        .from("warmup_plans")
        .update({ status })
        .eq("id", planId);
      if (error) {
        toast.error("Failed to update plan");
      } else {
        toast.success(`Plan ${status}`);
        fetchPlans();
      }
    },
    [fetchPlans]
  );

  const logDay = useCallback(
    async (planId: string, dayNumber: number, recommendedVolume: number, actualVolume: number, bounceRate?: number, complaintRate?: number, notes?: string) => {
      if (!userId) return;
      const status = bounceRate && bounceRate > 2 ? "issue" : "completed";
      const { error } = await supabase.from("warmup_daily_logs").insert({
        plan_id: planId,
        user_id: userId,
        day_number: dayNumber,
        recommended_volume: recommendedVolume,
        actual_volume: actualVolume,
        bounce_rate: bounceRate ?? null,
        complaint_rate: complaintRate ?? null,
        status,
        notes: notes || null,
      });
      if (error) {
        toast.error("Failed to log day");
      } else {
        toast.success("Day logged!");
        fetchLogs(planId);
        // Advance current_day
        await supabase
          .from("warmup_plans")
          .update({ current_day: dayNumber + 1 })
          .eq("id", planId);
        fetchPlans();
      }
    },
    [userId, fetchLogs, fetchPlans]
  );

  const deletePlan = useCallback(
    async (planId: string) => {
      const { error } = await supabase.from("warmup_plans").delete().eq("id", planId);
      if (error) {
        toast.error("Failed to delete plan");
      } else {
        toast.success("Plan deleted");
        fetchPlans();
      }
    },
    [fetchPlans]
  );

  return { plans, logs, loading, fetchLogs, createPlan, updatePlanStatus, logDay, deletePlan };
}
