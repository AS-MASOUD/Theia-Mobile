"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Check, Loader2, ArrowLeft } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-context";

interface MobileOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileOnboardingModal({ isOpen, onClose }: MobileOnboardingModalProps) {
  const queryClient = useQueryClient();
  const { refreshProfile } = useAuth();

  const [job, setJob] = useState("مهندس نرم‌افزار");
  const [monthlyIncome, setMonthlyIncome] = useState("85000000");
  const [liquidAssets, setLiquidAssets] = useState("310000000");
  const [investmentAssets, setInvestmentAssets] = useState("535000000");
  const [totalLiabilities, setTotalLiabilities] = useState("95000000");
  const [errorMsg, setErrorMsg] = useState("");

  const mutation = useMutation({
    mutationFn: () => {
      const income = parseFloat(monthlyIncome.replace(/,/g, "")) || 0;
      const liquid = parseFloat(liquidAssets.replace(/,/g, "")) || 0;
      const investment = parseFloat(investmentAssets.replace(/,/g, "")) || 0;
      const liab = parseFloat(totalLiabilities.replace(/,/g, "")) || 0;

      return api.submitFinancialOnboarding({
        job: job.trim() || "کاربر تئا",
        monthly_income: income,
        liquid_assets: liquid,
        investment_assets: investment,
        total_liabilities: liab,
        financial_goals: ["استقلال مالی زودهنگام (FIRE)", "سرمایه‌گذاری طلا"],
      });
    },
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-overview"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-snapshots"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-positions"] });
      queryClient.invalidateQueries({ queryKey: ["cashflow-summary"] });
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در ثبت اطلاعات مالی";
      setErrorMsg(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    mutation.mutate();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="تکمیل پرونده مالی اولیه"
      description="ثبت دارایی‌های مبنا جهت فعال‌سازی محاسبات ثروت و نمودارهای تحلیلی"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorMsg && (
          <div className="p-3 rounded-[12px] bg-[#1B1D21] border border-[#C77A82]/30 text-xs text-[#C77A82]">
            {errorMsg}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">عنوان شغلی یا حرفه</label>
          <input
            type="text"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder="مثال: مدیر محصول، پزشک، مهندس، کسب‌وکار آزاد"
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">درآمد ماهانه تقریبی (تومان)</label>
          <input
            type="text"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            placeholder="مثال: ۸۵,۰۰۰,۰۰۰"
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">نقدینگی در دسترس (تومان)</label>
            <input
              type="text"
              value={liquidAssets}
              onChange={(e) => setLiquidAssets(e.target.value)}
              placeholder="سپرده‌ها و نقد"
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">سرمایه‌گذاری‌ها (تومان)</label>
            <input
              type="text"
              value={investmentAssets}
              onChange={(e) => setInvestmentAssets(e.target.value)}
              placeholder="طلا، سهام، ملک"
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">مجموع بدهی‌ها و وام‌ها (تومان)</label>
          <input
            type="text"
            value={totalLiabilities}
            onChange={(e) => setTotalLiabilities(e.target.value)}
            placeholder="مانده اصل وام‌ها"
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-3 rounded-[14px] btn-illuminated-amber text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer mt-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>در حال راه‌اندازی پرونده...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 stroke-[2]" />
              <span>فعال‌سازی داشبورد ثروت</span>
            </>
          )}
        </button>
      </form>
    </BottomSheet>
  );
}
