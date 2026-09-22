import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HealthBadgeProps {
  health: number;
  className?: string;
}

export function HealthBadge({ health, className }: HealthBadgeProps) {
  if (health >= 80) {
    return (
      <Badge className={cn("bg-success hover:bg-success/80", className)}>
        Healthy
      </Badge>
    );
  }
  
  if (health >= 50) {
    return (
      <Badge className={cn("bg-warning hover:bg-warning/80", className)}>
        Warning
      </Badge>
    );
  }
  
  return (
    <Badge variant="destructive" className={className}>
      Critical
    </Badge>
  );
}
