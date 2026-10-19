"use client";

import React, { useRef, useState, useEffect } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";

export type MobileAuthTransitionState =
  | "idle"
  | "authenticating"
  | "success"
  | "exiting"
  | "error";

interface GlassAuthCardProps {
  children: React.ReactNode;
  transitionState?: MobileAuthTransitionState;
  statusText?: string;
  onCancelSubmitting?: () => void;
  className?: string;
}

export function GlassAuthCard({
  children,
  transitionState = "idle",
  statusText,
  onCancelSubmitting,
  className,
}: GlassAuthCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 360, height: 500 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        if (offsetWidth > 0 && offsetHeight > 0) {
          setDimensions({ width: offsetWidth, height: offsetHeight });
        }
      }
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  const { width, height } = dimensions;

  // Geometry: chamfered top-left & bottom-right, rounded top-right & bottom-left
  const chamfer = Math.min(72, Math.max(66, Math.floor(width * 0.175)));
  const radius = Math.min(22, Math.max(16, Math.floor(width * 0.055)));

  const cardPath = `
    M ${chamfer} 0
    H ${Math.max(0, width - radius)}
    A ${radius} ${radius} 0 0 1 ${width} ${radius}
    V ${Math.max(0, height - chamfer)}
    L ${Math.max(0, width - chamfer)} ${height}
    H ${radius}
    A ${radius} ${radius} 0 0 1 0 ${Math.max(0, height - radius)}
    V ${chamfer}
    L ${chamfer} 0
    Z
  `.replace(/\s+/g, " ").trim();

  // Corner decorations resting size (56px for mobile)
  const cornerDecoSize = 56;
  const cornerOffset = 1;

  const pathTL = "M 16 2 L 46 2 C 51 2 54 4 56 7 C 57 9 56 12 53 15 L 15 53 C 12 56 9 57 7 56 C 4 54 2 51 2 46 L 2 16 C 2 7 7 2 16 2 Z";
  const pathBR = "M 44 58 L 14 58 C 9 58 6 56 4 53 C 3 51 4 48 7 45 L 45 7 C 48 4 51 3 53 4 C 56 6 58 9 58 14 L 58 44 C 58 53 53 58 44 58 Z";

  const isCentered =
    transitionState === "authenticating" ||
    transitionState === "success" ||
    transitionState === "exiting";

  const centerSplitOffset = 5;
  const restingCenterX = cornerOffset + cornerDecoSize / 2;
  const restingCenterY = cornerOffset + cornerDecoSize / 2;

  const targetTL_X = width / 2 - centerSplitOffset;
  const targetTL_Y = height / 2 - centerSplitOffset;
  const deltaTL_X = isCentered ? targetTL_X - restingCenterX : 0;
  const deltaTL_Y = isCentered ? targetTL_Y - restingCenterY : 0;

  const deltaBR_X = isCentered ? -(targetTL_X - restingCenterX) : 0;
  const deltaBR_Y = isCentered ? -(targetTL_Y - restingCenterY) : 0;

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-3 overflow-hidden bg-[#0A0B0E]">
      {/* Ambient Lighting & Golden Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#121318_0%,#0A0B0E_100%)]" />

        <div
          className="absolute -top-24 -right-20 w-[420px] h-[420px] rounded-full opacity-25 blur-[100px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(240, 174, 85, 0.45) 0%, rgba(200, 115, 20, 0.15) 50%, transparent 75%)",
          }}
        />

        <div
          className="absolute -bottom-28 -left-20 w-[400px] h-[400px] rounded-full opacity-22 blur-[100px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(240, 174, 85, 0.38) 0%, rgba(180, 85, 10, 0.12) 50%, transparent 75%)",
          }}
        />

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[100px] opacity-15 pointer-events-none blur-3xl transform -rotate-[35deg]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(240, 174, 85, 0.25) 40%, rgba(240, 174, 85, 0.3) 50%, rgba(200, 115, 20, 0.12) 65%, transparent 100%)",
          }}
        />
      </div>

      {/* Main Glass Card Wrapper */}
      <div
        ref={containerRef}
        className={clsx(
          "relative w-full max-w-[385px] z-10 transition-all duration-200 ease-out",
          transitionState === "exiting" ? "opacity-0 scale-[0.985]" : "opacity-100 scale-100",
          className
        )}
      >
        {/* SVG Definition for Card Clipping and Crisp Outline */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{ overflow: "visible" }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="mobileGlassBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.24)" />
              <stop offset="35%" stopColor="rgba(255, 255, 255, 0.07)" />
              <stop offset="75%" stopColor="rgba(240, 174, 85, 0.18)" />
              <stop offset="100%" stopColor="rgba(240, 174, 85, 0.38)" />
            </linearGradient>

            <filter id="mobileBorderGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#000000" floodOpacity="0.75" />
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F0AE55" floodOpacity="0.08" />
            </filter>

            <clipPath id="mobileAuthCardClip">
              <path d={cardPath} />
            </clipPath>
          </defs>

          <path
            d={cardPath}
            fill="none"
            stroke="url(#mobileGlassBorderGrad)"
            strokeWidth="1.15"
            filter="url(#mobileBorderGlow)"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Backdrop Glass Surface */}
        <div
          className="absolute inset-0 backdrop-blur-2xl bg-[#111216]/82 pointer-events-none z-0"
          style={{ clipPath: "url(#mobileAuthCardClip)" }}
          aria-hidden="true"
        />

        {/* Top-Left Corner Decoration */}
        <div
          className="absolute z-10 pointer-events-none will-change-transform"
          aria-hidden="true"
          style={{
            top: `${cornerOffset}px`,
            left: `${cornerOffset}px`,
            width: `${cornerDecoSize}px`,
            height: `${cornerDecoSize}px`,
            transform: `translate3d(${deltaTL_X}px, ${deltaTL_Y}px, 0) scale(${isCentered ? 1.28 : 1})`,
            transformOrigin: "center center",
            transition: "transform 800ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease",
          }}
        >
          <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-[0_2px_8px_rgba(240,174,85,0.18)]">
            <path
              d={pathTL}
              fill={isCentered ? "rgba(240, 174, 85, 0.08)" : "rgba(255, 255, 255, 0.015)"}
              stroke={
                transitionState === "success"
                  ? "rgba(240, 174, 85, 1)"
                  : isCentered
                  ? "rgba(240, 174, 85, 0.9)"
                  : "rgba(255, 255, 255, 0.3)"
              }
              strokeWidth="1.2"
              className="transition-colors duration-400"
            />
          </svg>
        </div>

        {/* Bottom-Right Corner Decoration */}
        <div
          className="absolute z-10 pointer-events-none will-change-transform"
          aria-hidden="true"
          style={{
            bottom: `${cornerOffset}px`,
            right: `${cornerOffset}px`,
            width: `${cornerDecoSize}px`,
            height: `${cornerDecoSize}px`,
            transform: `translate3d(${deltaBR_X}px, ${deltaBR_Y}px, 0) scale(${isCentered ? 1.28 : 1})`,
            transformOrigin: "center center",
            transition: "transform 800ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease",
          }}
        >
          <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-[0_2px_8px_rgba(240,174,85,0.18)]">
            <path
              d={pathBR}
              fill={isCentered ? "rgba(240, 174, 85, 0.08)" : "rgba(255, 255, 255, 0.015)"}
              stroke={
                transitionState === "success"
                  ? "rgba(240, 174, 85, 1)"
                  : isCentered
                  ? "rgba(240, 174, 85, 0.9)"
                  : "rgba(240, 174, 85, 0.38)"
              }
              strokeWidth="1.2"
              className="transition-colors duration-400"
            />
          </svg>
        </div>

        {/* Central Radial Bloom */}
        <div
          className={clsx(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full pointer-events-none transition-all duration-700 z-10",
            isCentered ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
          style={{
            background:
              transitionState === "success"
                ? "radial-gradient(circle, rgba(240, 174, 85, 0.42) 0%, rgba(240, 174, 85, 0.18) 45%, transparent 72%)"
                : "radial-gradient(circle, rgba(240, 174, 85, 0.28) 0%, rgba(200, 115, 20, 0.1) 45%, transparent 72%)",
          }}
          aria-hidden="true"
        />

        {/* Centered Status Overlay during submission */}
        <div
          className={clsx(
            "absolute inset-0 z-30 flex flex-col items-center justify-center p-5 text-center transition-all duration-500",
            isCentered ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
          )}
        >
          <div className="w-[80px] h-[80px] mb-6 relative flex items-center justify-center">
            {transitionState === "success" && (
              <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in-75 duration-300">
                <div className="w-8 h-8 rounded-full bg-[#F0AE55] text-[#0D0E10] flex items-center justify-center shadow-lg shadow-[#F0AE55]/40">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 max-w-xs animate-in fade-in zoom-in-95 duration-500 delay-200">
            <h3 className="text-base font-bold text-[#F4F4F5] tracking-tight">
              {transitionState === "success" ? "ورود موفقیت‌آمیز" : "در حال اعتبارسنجی"}
            </h3>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              {statusText || "ارتباط امن با سرور برقرار شد؛ در حال ورود..."}
            </p>
            <div className="w-28 h-1 bg-[#27272A] rounded-full mx-auto overflow-hidden mt-3">
              <div
                className={clsx(
                  "h-full rounded-full transition-all duration-500",
                  transitionState === "success"
                    ? "w-full bg-[#76A98C]"
                    : "w-full bg-[#F0AE55] origin-right animate-pulse"
                )}
              />
            </div>
            {transitionState === "authenticating" && onCancelSubmitting && (
              <button
                type="button"
                onClick={onCancelSubmitting}
                className="pointer-events-auto mt-3 text-[11px] text-[#A1A1AA] hover:text-[#F0AE55] underline cursor-pointer"
              >
                انصراف و بازگشت
              </button>
            )}
          </div>
        </div>

        {/* CARD FORM CONTENT */}
        <div
          className={clsx(
            "relative z-20 px-5 py-5 sm:px-6 sm:py-5.5 transition-all duration-300 ease-in-out",
            isCentered
              ? "opacity-0 scale-95 blur-[2px] pointer-events-none select-none"
              : "opacity-100 scale-100 blur-0 pointer-events-auto"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
