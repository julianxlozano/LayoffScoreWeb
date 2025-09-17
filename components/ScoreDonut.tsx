"use client";

import { useMemo } from "react";
import styles from "./ScoreDonut.module.css";

interface ScoreDonutProps {
  score: number;
  riskLevel: string;
  startColor: string;
  endColor: string;
}

export default function ScoreDonut({
  score,
  riskLevel,
  startColor,
  endColor,
}: ScoreDonutProps) {
  const { dashOffset, trackColor } = useMemo(() => {
    const size = 220;
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.max(0, Math.min(100, score));
    const offset = circumference * (1 - progress / 100);

    // Create track color with opacity
    const hexToRgba = (hex: string, alpha: number) => {
      let c = hex.replace("#", "");
      if (c.length === 3)
        c = c
          .split("")
          .map((x) => x + x)
          .join("");
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return {
      dashOffset: offset,
      trackColor: hexToRgba(endColor, 0.25),
    };
  }, [score, endColor]);

  const size = 220;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={styles.container}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={styles.progressCircle}
        />
      </svg>
      <div className={styles.centerOverlay}>
        <div className={styles.scoreText} style={{ color: endColor }}>
          {score}%
        </div>
        <div className={styles.riskLevelText}>{riskLevel} Risk</div>
      </div>
    </div>
  );
}
