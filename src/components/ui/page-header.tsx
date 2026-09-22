import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  align?: "left" | "center";
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  align = "left",
}: PageHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={`mb-8 flex flex-col gap-4 ${
        centered ? "items-center text-center" : "sm:flex-row sm:items-center sm:justify-between"
      }`}
    >
      <div className={centered ? "space-y-2" : "space-y-1"}>
        <h1
          className={`flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl ${
            centered ? "justify-center" : ""
          }`}
        >
          {Icon && <Icon className="h-7 w-7 shrink-0 text-primary md:h-8 md:w-8" aria-hidden="true" />}
          {title}
        </h1>
        {description && (
          <p className={`text-muted-foreground ${centered ? "max-w-2xl mx-auto" : "max-w-2xl"}`}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export default PageHeader;
