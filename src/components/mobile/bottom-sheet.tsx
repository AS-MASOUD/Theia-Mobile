"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Sheet Content */}
      <div className="relative z-10 w-full max-w-md max-h-[90dvh] flex flex-col bg-[#141518] border border-[rgba(255,255,255,0.08)] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-[#282A2F] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#282A2F]">
          <div>
            <h3 className="text-sm font-semibold text-[#E8E8E8]">{title}</h3>
            {description && (
              <p className="text-[11px] text-[#9A9DA5] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] flex items-center justify-center text-[#9A9DA5] hover:text-[#E8E8E8] active:scale-95 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
