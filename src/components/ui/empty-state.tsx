import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-border text-center ${
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-12"
      }`}
    >
      <div className="rounded-full bg-accent/60 p-3">
        <Icon
          className={`text-accent-foreground ${compact ? "h-5 w-5" : "h-6 w-6"}`}
          aria-hidden="true"
        />
      </div>
      <h3 className={`font-semibold text-foreground ${compact ? "text-sm" : "text-base"}`}>
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

export default EmptyState;
