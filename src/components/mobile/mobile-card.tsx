"use client";

import React from "react";
import Link from "next/link";

interface MobileCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  badge?: string;
  badgeVariant?: "amber" | "emerald" | "cyan" | "coral" | "neutral";
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: "amber" | "emerald" | "cyan" | "coral" | "neutral";
  href?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function MobileCard({
  title,
  subtitle,
  value,
  badge,
  badgeVariant = "amber",
  icon: Icon,
  iconColor = "amber",
  href,
  onClick,
  className = "",
  children,
}: MobileCardProps) {
  const badgeClasses = {
    amber: "text-[#F0AE55] bg-[rgba(240,174,85,0.09)] border-[rgba(240,174,85,0.22)] shadow-[0_0_8px_rgba(240,174,85,0.12)]",
    emerald: "text-[#76A98C] bg-[rgba(118,169,140,0.1)] border-[rgba(118,169,140,0.22)] shadow-[0_0_8px_rgba(118,169,140,0.12)]",
    cyan: "text-[#88A9BC] bg-[rgba(136,169,188,0.1)] border-[rgba(136,169,188,0.22)] shadow-[0_0_8px_rgba(136,169,188,0.12)]",
    coral: "text-[#C77A82] bg-[rgba(199,122,130,0.1)] border-[rgba(199,122,130,0.22)] shadow-[0_0_8px_rgba(199,122,130,0.12)]",
    neutral: "text-[#9A9DA5] bg-[#191A1E] border-[#26282E]",
  }[badgeVariant];

  const iconClasses = {
    amber: "text-[#F0AE55] bg-[rgba(240,174,85,0.08)] border-[rgba(240,174,85,0.22)] shadow-[0_0_12px_rgba(240,174,85,0.15)]",
    emerald: "text-[#76A98C] bg-[rgba(118,169,140,0.08)] border-[rgba(118,169,140,0.22)] shadow-[0_0_12px_rgba(118,169,140,0.15)]",
    cyan: "text-[#88A9BC] bg-[rgba(136,169,188,0.08)] border-[rgba(136,169,188,0.22)] shadow-[0_0_12px_rgba(136,169,188,0.15)]",
    coral: "text-[#C77A82] bg-[rgba(199,122,130,0.08)] border-[rgba(199,122,130,0.22)] shadow-[0_0_12px_rgba(199,122,130,0.15)]",
    neutral: "text-[#9A9DA5] bg-[#191A1E] border-[#26282E]",
  }[iconColor];

  const cardContent = (
    <div
      onClick={onClick}
      className={`obsidian-card p-4 flex flex-col justify-between relative overflow-hidden group transition-all duration-150 cursor-pointer ${className}`}
    >
      {/* Top row: Icon & Status Badge */}
      <div className="flex items-center justify-between w-full mb-3">
        {Icon ? (
          <div
            className={`w-9 h-9 rounded-[14px] border flex items-center justify-center transition-colors ${iconClasses}`}
          >
            <Icon className="w-4 h-4 stroke-[1.8]" />
          </div>
        ) : (
          <div />
        )}

        {badge && (
          <span
            className={`text-[10px] font-medium tracking-normal px-2.5 py-0.5 rounded-full border ${badgeClasses}`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Middle/Bottom: Title, Value & Subtitle */}
      <div>
        <h3 className="text-xs font-normal text-[#9A9DA5] tracking-normal">
          {title}
        </h3>
        {value !== undefined && (
          <div className="text-lg font-normal text-[#E8E8E8] font-number mt-1 tracking-tight">
            {value}
          </div>
        )}
        {subtitle && (
          <p className="text-[11px] font-normal text-[#696D77] mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
