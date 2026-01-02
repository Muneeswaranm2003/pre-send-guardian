import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface IssueItemProps {
  severity: "high" | "medium" | "low";
  message: string;
  recommendation?: string;
}

const IssueItem = ({ severity, message, recommendation }: IssueItemProps) => {
  const config = {
    high: {
      icon: AlertCircle,
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/30",
      iconColor: "text-destructive",
    },
    medium: {
      icon: AlertTriangle,
      bgColor: "bg-[hsl(var(--warning))]/10",
      borderColor: "border-[hsl(var(--warning))]/30",
      iconColor: "text-[hsl(var(--warning))]",
    },
    low: {
      icon: Info,
      bgColor: "bg-[hsl(var(--info))]/10",
      borderColor: "border-[hsl(var(--info))]/30",
      iconColor: "text-[hsl(var(--info))]",
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor } = config[severity];

  return (
    <div className={`p-4 rounded-lg border ${bgColor} ${borderColor}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{message}</p>
          {recommendation && (
            <p className="text-xs text-muted-foreground mt-1">
              💡 {recommendation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueItem;
