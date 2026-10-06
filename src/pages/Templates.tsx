import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Pencil, Trash2, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FullPageSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useTemplates } from "@/hooks/useTemplates";
import { toast } from "sonner";

const riskVariant = (s: number) => (s >= 60 ? "destructive" : s >= 30 ? "secondary" : "outline");

const Templates = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { templates, loading, save, remove } = useTemplates();
  const [editId, setEditId] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);
  if (authLoading || loading) return <FullPageSpinner />;

  const reset = () => { setEditId(undefined); setName(""); setSubject(""); setBody(""); };
  const submit = async () => {
    if (!name.trim() || !subject.trim() || !body.trim()) { toast.error("Fill in name, subject and text"); return; }
    const { error } = await save({ id: editId, name: name.trim(), subject, body });
    if (error) toast.error(error); else { toast.success(editId ? "Template updated" : "Template saved"); reset(); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 max-w-6xl space-y-8">
        <PageHeader title="Email Templates" description="Save the emails you send often and reuse them in AI Review and your warmup reviews." icon={FileText} />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 space-y-4 lg:order-2 h-fit">
            <h2 className="font-semibold">{editId ? "Edit template" : "New template"}</h2>
            <div className="space-y-1"><Label htmlFor="t-name">Name</Label><Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="Monthly newsletter" /></div>
            <div className="space-y-1"><Label htmlFor="t-subject">Subject</Label><Input id="t-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={300} /></div>
            <div className="space-y-1"><Label htmlFor="t-body">Email text</Label><Textarea id="t-body" rows={8} value={body} onChange={(e) => setBody(e.target.value)} maxLength={20000} /></div>
            <div className="flex gap-2">
              <Button onClick={submit} className="flex-1">{editId ? "Update" : "Save template"}</Button>
              {editId && <Button variant="ghost" onClick={reset}>Cancel</Button>}
            </div>
          </Card>
          <div className="lg:col-span-2 lg:order-1 space-y-3">
            {templates.length === 0 ? (
              <EmptyState icon={FileText} title="No templates yet" description="Save your first email on the right." />
            ) : templates.map((t) => (
              <Card key={t.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{t.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.last_checked_at ? `Last checked ${new Date(t.last_checked_at).toLocaleDateString()}` : "Not checked yet"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {t.last_risk_score != null && <Badge variant={riskVariant(t.last_risk_score)}>Risk {t.last_risk_score}</Badge>}
                    <Button size="icon" variant="ghost" aria-label="Review with AI" onClick={() => navigate(`/advisor?template=${t.id}`)}><Sparkles className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => { setEditId(t.id); setName(t.name); setSubject(t.subject); setBody(t.body); }}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Templates;
