import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EmailTemplate } from "@/hooks/useTemplates";

interface Props {
  templates: EmailTemplate[];
  value?: string;
  onPick: (t: EmailTemplate) => void;
}

export default function TemplatePicker({ templates, value, onPick }: Props) {
  if (templates.length === 0) return null;
  return (
    <Select value={value} onValueChange={(id) => { const t = templates.find((x) => x.id === id); if (t) onPick(t); }}>
      <SelectTrigger aria-label="Use a saved template">
        <SelectValue placeholder="Use a saved template…" />
      </SelectTrigger>
      <SelectContent>
        {templates.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            {t.name}{t.last_risk_score != null ? ` · risk ${t.last_risk_score}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
