"use client";

import React from "react";

interface ArcGaugeProps {
  value: number; // 0 to 100
  targetValue?: number;
  label?: string;
  sublabel?: string;
  accentColor?: "amber" | "emerald" | "cyan";
  size?: number;
}

export function ArcGauge({
  value = 74,
  targetValue = 85,
  label = "شاخص سلامت مالی",
  sublabel = "در مسیر بهینه‌سازی تا هدف ۸۵",
  accentColor = "amber",
  size = 270,
}: ArcGaugeProps) {
  // 250 degree gauge arc calculation with elegant thin stroke matching reference thermostat
  const strokeWidth = 9;
  const radius = (size - strokeWidth * 3) / 2;
  const center = size / 2;

  // 250 degrees total angle, from 145 deg to 395 deg (open at bottom)
  const startAngle = 145;
  const totalAngle = 250;
  const currentAngle = startAngle + (Math.min(Math.max(value, 0), 100) / 100) * totalAngle;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
  };

  const bgPath = describeArc(center, center, radius, startAngle, startAngle + totalAngle);
  const activePath = describeArc(center, center, radius, startAngle, currentAngle);
  const indicatorPos = polarToCartesian(center, center, radius, currentAngle);

  const colorStyles = {
    amber: {
      gradient: "url(#amberGaugeGradient)",
      glowColor: "#F0AE55",
      circleFill: "#F0AE55",
      ambientGlow: "radial-gradient(circle at 62% 42%, rgba(240, 174, 85, 0.16) 0%, rgba(240, 174, 85, 0.04) 55%, transparent 74%)",
    },
    emerald: {
      gradient: "url(#emeraldGaugeGradient)",
      glowColor: "#76A98C",
      circleFill: "#76A98C",
      ambientGlow: "radial-gradient(circle at 62% 42%, rgba(118, 169, 140, 0.16) 0%, rgba(118, 169, 140, 0.04) 55%, transparent 74%)",
    },
    cyan: {
      gradient: "url(#cyanGaugeGradient)",
      glowColor: "#88A9BC",
      circleFill: "#88A9BC",
      ambientGlow: "radial-gradient(circle at 62% 42%, rgba(136, 169, 188, 0.16) 0%, rgba(136, 169, 188, 0.04) 55%, transparent 74%)",
    },
  }[accentColor];

  return (
    <div className="relative flex flex-col items-center justify-center py-2 select-none w-full">
      {/* Warm Ambient Diffused Glow behind the Dial (Reference Thermostat Screen 3) */}
      <div
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{ background: colorStyles.ambientGlow }}
      />

      <svg width={size} height={size * 0.9} viewBox={`0 0 ${size} ${size}`} className="relative z-10 overflow-visible">
        <defs>
          <filter id="arcSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5.5" result="blur" />
          </filter>

          <linearGradient id="amberGaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9C662B" />
            <stop offset="50%" stopColor="#C88B3E" />
            <stop offset="100%" stopColor="#F0AE55" />
          </linearGradient>

          <linearGradient id="emeraldGaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#436852" />
            <stop offset="100%" stopColor="#76A98C" />
          </linearGradient>

          <linearGradient id="cyanGaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4E6877" />
            <stop offset="100%" stopColor="#88A9BC" />
          </linearGradient>
        </defs>

        {/* Background Track - Subtle & Understated */}
        <path
          d={bgPath}
          fill="none"
          stroke="#1F2126"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Layer 1: Soft Diffused Warm Glow beneath Active Arc */}
        <path
          d={activePath}
          fill="none"
          stroke={colorStyles.glowColor}
          strokeWidth={strokeWidth * 2.2}
          strokeLinecap="round"
          opacity="0.4"
          filter="url(#arcSoftGlow)"
        />

        {/* Layer 2: Crisp Active Arc above illumination */}
        <path
          d={activePath}
          fill="none"
          stroke={colorStyles.gradient}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Tip Indicator Knob with subtle luminous halo */}
        <circle
          cx={indicatorPos.x}
          cy={indicatorPos.y}
          r={strokeWidth * 0.95}
          fill={colorStyles.circleFill}
          opacity="0.45"
          filter="url(#arcSoftGlow)"
        />
        <circle
          cx={indicatorPos.x}
          cy={indicatorPos.y}
          r={strokeWidth * 0.52}
          fill="#FFF4E2"
          stroke="#141518"
          strokeWidth="2"
        />
      </svg>

      {/* Central Value & Typography - Clean, Calm, Dominant (Reference: 72) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center top-2 pointer-events-none z-20">
        <span className="text-6xl font-normal tracking-tight text-[#E8E8E8] font-number">
          {value}
        </span>
        <span className="text-xs text-[#9A9DA5] font-medium tracking-wide mt-2">
          {targetValue ? `هدف: ${targetValue}` : label}
        </span>
        {sublabel && (
          <span className="text-[11px] text-[#696D77] font-normal mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
