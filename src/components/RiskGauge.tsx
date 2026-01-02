import { useEffect, useState } from "react";

interface RiskGaugeProps {
  riskScore: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const RiskGauge = ({ riskScore, size = "md", animated = true }: RiskGaugeProps) => {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : riskScore);

  const sizeConfig = {
    sm: { width: 120, strokeWidth: 8, fontSize: "text-2xl" },
    md: { width: 180, strokeWidth: 10, fontSize: "text-4xl" },
    lg: { width: 240, strokeWidth: 12, fontSize: "text-5xl" },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { label: "LOW", color: "hsl(var(--success))", gradient: "var(--gradient-risk-low)" };
    if (score <= 60) return { label: "MEDIUM", color: "hsl(var(--warning))", gradient: "var(--gradient-risk-medium)" };
    return { label: "HIGH", color: "hsl(var(--destructive))", gradient: "var(--gradient-risk-high)" };
  };

  const risk = getRiskLevel(riskScore);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(riskScore);
      return;
    }
    
    const duration = 1500;
    const startTime = Date.now();
    const startScore = displayScore;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startScore + (riskScore - startScore) * easeOut;
      
      setDisplayScore(Math.round(current));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [riskScore, animated]);

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg
        width={config.width}
        height={config.width}
        viewBox={`0 0 ${config.width} ${config.width}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={config.strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke={risk.color}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300"
          style={{
            filter: `drop-shadow(0 0 10px ${risk.color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${config.fontSize} font-bold text-foreground`}>
          {displayScore}%
        </span>
        <span 
          className="text-sm font-semibold tracking-wider"
          style={{ color: risk.color }}
        >
          {risk.label} RISK
        </span>
      </div>
    </div>
  );
};

export default RiskGauge;
