import { CheckCircle, XCircle, AlertTriangle, Clock, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusType = "valid" | "invalid" | "missing" | "unknown" | "clean" | "warning" | "critical";

interface StatusIconProps {
  status: StatusType | string | null;
  className?: string;
}

const statusConfig: Record<StatusType, { icon: LucideIcon; colorClass: string }> = {
  valid: { icon: CheckCircle, colorClass: "text-[hsl(var(--success))]" },
  clean: { icon: CheckCircle, colorClass: "text-[hsl(var(--success))]" },
  invalid: { icon: AlertTriangle, colorClass: "text-[hsl(var(--warning))]" },
  warning: { icon: AlertTriangle, colorClass: "text-[hsl(var(--warning))]" },
  missing: { icon: XCircle, colorClass: "text-destructive" },
  critical: { icon: XCircle, colorClass: "text-destructive" },
  unknown: { icon: Clock, colorClass: "text-muted-foreground" },
};

export function StatusIcon({ status, className }: StatusIconProps) {
  const normalizedStatus = (status?.toLowerCase() || "unknown") as StatusType;
  const config = statusConfig[normalizedStatus] || statusConfig.unknown;
  const Icon = config.icon;

  return <Icon className={cn("w-4 h-4", config.colorClass, className)} />;
}
