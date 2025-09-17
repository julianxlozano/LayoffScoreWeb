"use client";

import React from "react";
import styles from "./ShieldBadge.module.css";

interface ShieldBadgeProps {
  size?: number; // base width in px; height will scale proportionally
}

export default function ShieldBadge({ size = 120 }: ShieldBadgeProps) {
  // The viewBox is designed to be 64x72 to accommodate a classic shield ratio
  const width = size;
  const height = Math.round(size * (72 / 64));

  return (
    <div className={styles.wrapper} style={{ width, height }}>
      <svg
        className={styles.svg}
        width={width}
        height={height}
        viewBox="0 0 64 72"
        aria-hidden
        focusable="false"
      >
        {/* Soft radial glow behind the badge */}
        <defs>
          <radialGradient id="shieldGlow" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ff2a2a" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#ff2a2a" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ff2a2a" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* In-bounds circular glow to avoid any background tint */}
        <circle cx="32" cy="28" r="26" fill="url(#shieldGlow)" />

        {/* Shield body (filled dark), then thick red outline */}
        <path
          d="M32 4 L54 12 V31 c0 15 -9.5 28 -22 34 C19.5 59 10 46 10 31 V12 L32 4 Z"
          fill="#0f0f10"
        />
        <path
          d="M32 4 L54 12 V31 c0 15 -9.5 28 -22 34 C19.5 59 10 46 10 31 V12 L32 4 Z"
          fill="none"
          stroke="#ff4444"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />

        {/* Lightning bolt from Tabler SVG, centered and scaled */}
        <g transform="translate(32,32) scale(1.3) translate(-12,-12)">
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}
