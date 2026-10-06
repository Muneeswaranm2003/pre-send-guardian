import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

export type EmailTemplate = Tables<"email_templates">;

export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setTemplates([]); setLoading(false); return; }
    const { data } = await supabase.from("email_templates").select("*").order("updated_at", { ascending: false });
    setTemplates(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback(async (t: { id?: string; name: string; subject: string; body: string }) => {
    if (!user) return { error: "Sign in to save templates" };
    const { error } = t.id
      ? await supabase.from("email_templates").update({ name: t.name, subject: t.subject, body: t.body }).eq("id", t.id)
      : await supabase.from("email_templates").insert({ ...t, user_id: user.id });
    await refresh();
    return { error: error?.message };
  }, [user, refresh]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("email_templates").delete().eq("id", id);
    await refresh();
  }, [refresh]);

  const recordScore = useCallback(async (id: string, score: number) => {
    await supabase.from("email_templates")
      .update({ last_risk_score: Math.round(score), last_checked_at: new Date().toISOString() })
      .eq("id", id);
    await refresh();
  }, [refresh]);

  return { templates, loading, save, remove, recordScore, signedIn: !!user };
}
