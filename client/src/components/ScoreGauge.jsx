import { useMemo } from "react";

const ScoreGauge = ({ score }) => {
  const radius = 72;
  const strokeWidth = 10;
  const size = 200;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = useMemo(() => {
    if (score >= 75) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  }, [score]);

  const label = useMemo(() => {
    if (score >= 75) return "Excellent";
    if (score >= 50) return "Good";
    if (score >= 25) return "Needs Work";
    return "Low Match";
  }, [score]);

  const bgGlow = useMemo(() => {
    if (score >= 75) return "rgba(16, 185, 129, 0.06)";
    if (score >= 50) return "rgba(245, 158, 11, 0.06)";
    return "rgba(239, 68, 68, 0.06)";
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-full p-3" style={{ background: bgGlow }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="score-ring"
        >
          <circle
            className="score-ring-bg"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <circle
            className="score-ring-fill"
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: "rotate(0deg)" }}
        >
          <span
            className="text-5xl font-extrabold tracking-tight"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-xs text-surface-500 mt-1 font-semibold uppercase tracking-widest">
            ATS Score
          </span>
        </div>
      </div>
      <span
        className="px-5 py-1.5 rounded-full text-sm font-semibold tracking-wide"
        style={{
          background: `${color}15`,
          color: color,
          border: `1px solid ${color}25`,
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default ScoreGauge;
