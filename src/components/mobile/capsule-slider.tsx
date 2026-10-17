"use client";

import React, { useRef, useState, useCallback } from "react";

interface CapsuleSliderProps {
  value: number; // 0 to 100
  label: string;
  sublabel?: string;
  onChange?: (val: number) => void;
  height?: number; // px, default 240
}

export function CapsuleSlider({
  value,
  label,
  sublabel,
  onChange,
  height = 240,
}: CapsuleSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculatePercentage = useCallback(
    (clientY: number) => {
      if (!containerRef.current) return value;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      const h = rect.height;
      const percentage = 100 - (relativeY / h) * 100;
      return Math.round(Math.min(Math.max(percentage, 0), 100));
    },
    [value]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const newVal = calculatePercentage(e.clientY);
    onChange?.(newVal);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newVal = calculatePercentage(e.clientY);
    onChange?.(newVal);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Adaptive text placement and contrast based on fill height
  const isTextInsideFill = value >= 32;

  return (
    <div className="flex-1 flex flex-col items-center">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ height }}
        className={`w-full bg-[#15161A] rounded-[28px] relative overflow-hidden select-none cursor-pointer touch-none shadow-[inset_0_3px_8px_rgba(0,0,0,0.65)] transition-all duration-150 ${
          isDragging
            ? "border border-[rgba(240,174,85,0.35)] shadow-[inset_0_3px_8px_rgba(0,0,0,0.65),0_0_14px_rgba(240,174,85,0.15)]"
            : "border border-[#26282E]"
        }`}
      >
        {/* Filled Region - Soft Illuminated Warm Amber Gradient (Loyal to Screen 2) */}
        <div
          style={{ height: `${value}%` }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#88551E] via-[#B87C34] to-[#D69446] transition-[height] duration-75 ease-out rounded-b-[26px] overflow-visible"
        >
          {/* Luminous Fill Boundary Highlight Line (Thin glowing filament) */}
          <div className="w-full h-[1.5px] bg-[#FFE1A3] shadow-[0_0_8px_rgba(240,174,85,0.85)] relative z-10" />

          {/* Diffused Warm Light Bleed above and below boundary */}
          <div className="absolute -top-3 left-0 right-0 h-6 bg-[radial-gradient(ellipse_at_center,rgba(240,174,85,0.45)_0%,rgba(240,174,85,0.1)_50%,transparent_75%)] pointer-events-none" />
        </div>

        {/* Adaptive Value & Persian Label (Crisp, Calm, Perfectly Positioned) */}
        <div
          className={`absolute inset-x-0 flex flex-col items-center justify-center pointer-events-none z-20 px-2 transition-all duration-150 ${
            isTextInsideFill
              ? "bottom-7 text-center"
              : value < 18
              ? "bottom-6 text-center"
              : "top-8 text-center"
          }`}
        >
          <span
            className={`text-2xl font-normal font-number tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)] ${
              isTextInsideFill ? "text-[#FFFFFF]" : "text-[#E8E8E8]"
            }`}
          >
            {value}%
          </span>
          <span
            className={`text-[11px] font-medium tracking-wider uppercase mt-1 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] ${
              isTextInsideFill ? "text-[#FDE7C9]" : "text-[#9A9DA5]"
            }`}
          >
            {label}
          </span>
          {sublabel && (
            <span
              className={`text-[9px] mt-0.5 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${
                isTextInsideFill ? "text-[#E2BFA0]" : "text-[#696D77]"
              }`}
            >
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
