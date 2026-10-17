"use client";

import React, { useRef, useState, useCallback } from "react";

interface ColorTempSliderProps {
  value: number; // 0 to 100
  onChange?: (val: number) => void;
  title?: string;
  leftLabel?: string;
  rightLabel?: string;
  activeLabel?: string;
}

export function ColorTempSlider({
  value,
  onChange,
  title = "افق سرمایه‌گذاری و تحمل ریسک",
  leftLabel = "کوتاه‌مدت (کم‌ریسک)",
  rightLabel = "بلندمدت (رشد بالا)",
  activeLabel = "تعادل طلایی",
}: ColorTempSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateX = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const percentage = (relativeX / rect.width) * 100;
      return Math.round(Math.min(Math.max(percentage, 0), 100));
    },
    [value]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const newVal = calculateX(e.clientX);
    onChange?.(newVal);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newVal = calculateX(e.clientX);
    onChange?.(newVal);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="obsidian-card p-4.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#9A9DA5]">
          {title}
        </span>
        <span className="text-xs font-medium text-[#F0AE55] bg-[rgba(240,174,85,0.09)] px-2.5 py-0.5 rounded-full border border-[rgba(240,174,85,0.25)] shadow-[0_0_10px_rgba(240,174,85,0.12)]">
          {activeLabel}
        </span>
      </div>

      {/* Slider Track - Smooth Cool Blue to Warm Amber Gradient */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="temp-slider-track cursor-pointer touch-none select-none relative my-3"
      >
        {/* Draggable Knob - Tactile White Disc with Soft Localized Halo (Reference Screen 2) */}
        <div
          style={{ left: `${value}%` }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#FFFFFF] border-2 border-[#15161A] shadow-[0_2px_8px_rgba(0,0,0,0.65),0_0_12px_rgba(240,174,85,0.38)] pointer-events-none transition-transform duration-75 active:scale-105"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] font-normal text-[#696D77] mt-1.5 px-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
