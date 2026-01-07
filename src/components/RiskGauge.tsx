import { useEffect, useState, useRef, memo } from "react";

interface RiskGaugeProps {
  riskScore: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const SIZE_CONFIG = {
  sm: { width: 120, strokeWidth: 8, fontSize: "text-2xl" },
  md: { width: 180, strokeWidth: 10, fontSize: "text-4xl" },
  lg: { width: 240, strokeWidth: 12, fontSize: "text-5xl" },
} as const;

function getRiskLevel(score: number) {
  if (score <= 30) return { label: "LOW", color: "hsl(var(--success))" };
  if (score <= 60) return { label: "MEDIUM", color: "hsl(var(--warning))" };
  return { label: "HIGH", color: "hsl(var(--destructive))" };
}

function RiskGauge({ riskScore, size = "md", animated = true }: RiskGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : riskScore);
  const animationRef = useRef<number | null>(null);

  const config = SIZE_CONFIG[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
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
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [riskScore, animated]);

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg
        width={config.width}
        height={config.width}
        viewBox={`0 0 ${config.width} ${config.width}`}
        className="transform -rotate-90"
        role="img"
        aria-label={`Risk score: ${displayScore}% - ${risk.label} risk`}
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
}

export default memo(RiskGauge);
