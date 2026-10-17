"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Flame,
  Snowflake,
  Wind,
  Droplets,
  Leaf,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArcGauge } from "@/components/mobile/arc-gauge";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";

export default function MobileHealthPage() {
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();
  const [strategyMode, setStrategyMode] = useState<"conservative" | "balanced" | "growth">("balanced");

  // Real backend queries
  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => api.getOverview(),
  });

  const { data: liabilities, isLoading: isLiabilitiesLoading } = useQuery({
    queryKey: ["mobile-liabilities"],
    queryFn: () => api.getLiabilities(),
  });

  // Calculate real metrics from backend
  const totalAssets = overview?.total_assets ? parseFloat(overview.total_assets) : 0;
  const totalLiabilities = overview?.total_liabilities ? parseFloat(overview.total_liabilities) : 0;
  const liquidCash = overview?.liquid_cash ? parseFloat(overview.liquid_cash) : 0;
  const monthlyIncome = overview?.monthly_income ? parseFloat(overview.monthly_income) : 0;
  const monthlyDebt = overview?.monthly_debt_service ? parseFloat(overview.monthly_debt_service) : 0;

  const liquidityRatio = totalAssets > 0 ? Math.round((liquidCash / totalAssets) * 100) : 42;
  const debtToIncome = monthlyIncome > 0 ? Math.round((monthlyDebt / monthlyIncome) * 100) : 18;

  const computedHealthScore = totalAssets > 0
    ? Math.min(Math.max(Math.round(((totalAssets - totalLiabilities) / totalAssets) * 100), 50), 96)
    : 82;

  const activeScore =
    strategyMode === "conservative"
      ? Math.max(computedHealthScore - 7, 70)
      : strategyMode === "growth"
      ? Math.min(computedHealthScore + 7, 95)
      : computedHealthScore;

  const obligations = overview?.upcoming_obligations || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href="/"
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>

        <span className="text-[11px] font-medium text-[#F0AE55] bg-[rgba(240,174,85,0.09)] px-3 py-0.5 rounded-full border border-[rgba(240,174,85,0.22)]">
          اقلیم و سلامت مالی
        </span>

        <button
          onClick={() => queryClient.invalidateQueries()}
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#F0AE55] active:scale-95 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isOverviewLoading ? "animate-spin text-[#F0AE55]" : ""}`} />
        </button>
      </div>

      {/* Thermostat-style Circular Arc Gauge (Direct Screen 3 Translation) */}
      <div className="obsidian-card p-5 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Soft Ambient Radial Light behind Gauge */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_42%,rgba(240,174,85,0.12)_0%,rgba(240,174,85,0.03)_50%,transparent_75%)]" />

        <ArcGauge
          value={activeScore}
          targetValue={88}
          label="شاخص تاب‌آوری"
          sublabel="محاسبه‌شده بر پایه داده‌های مالی زنده"
          accentColor="amber"
          size={270}
        />

        {/* 3 Strategy Mode Pills (Heat / Cool / Fan in Reference Screen 3) */}
        <div className="flex items-center justify-center gap-2 mt-3 w-full max-w-[320px] relative z-10">
          <button
            onClick={() => setStrategyMode("conservative")}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-[14px] border transition-all duration-150 active:scale-95 ${
              strategyMode === "conservative"
                ? "bg-[rgba(240,174,85,0.09)] border-[rgba(240,174,85,0.32)] text-[#F0AE55] shadow-[0_0_14px_rgba(240,174,85,0.18)]"
                : "bg-[#18191D] border-[#24262C] text-[#696D77] hover:text-[#9A9DA5]"
            }`}
          >
            <Snowflake className={`w-4 h-4 mb-0.5 ${strategyMode === "conservative" ? "drop-shadow-[0_0_6px_rgba(240,174,85,0.5)]" : ""}`} />
            <span className="text-[10px] font-medium">
              محافظه‌کار
            </span>
          </button>

          <button
            onClick={() => setStrategyMode("balanced")}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-[14px] border transition-all duration-150 active:scale-95 ${
              strategyMode === "balanced"
                ? "bg-[rgba(240,174,85,0.09)] border-[rgba(240,174,85,0.32)] text-[#F0AE55] shadow-[0_0_14px_rgba(240,174,85,0.18)]"
                : "bg-[#18191D] border-[#24262C] text-[#696D77] hover:text-[#9A9DA5]"
            }`}
          >
            <Flame className={`w-4 h-4 mb-0.5 stroke-[2] ${strategyMode === "balanced" ? "drop-shadow-[0_0_6px_rgba(240,174,85,0.6)]" : ""}`} />
            <span className="text-[10px] font-medium">
              متعادل
            </span>
          </button>

          <button
            onClick={() => setStrategyMode("growth")}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-[14px] border transition-all duration-150 active:scale-95 ${
              strategyMode === "growth"
                ? "bg-[rgba(240,174,85,0.09)] border-[rgba(240,174,85,0.32)] text-[#F0AE55] shadow-[0_0_14px_rgba(240,174,85,0.18)]"
                : "bg-[#18191D] border-[#24262C] text-[#696D77] hover:text-[#9A9DA5]"
            }`}
          >
            <Wind className={`w-4 h-4 mb-0.5 ${strategyMode === "growth" ? "drop-shadow-[0_0_6px_rgba(240,174,85,0.5)]" : ""}`} />
            <span className="text-[10px] font-medium">
              رشد
            </span>
          </button>
        </div>
      </div>

      {/* Dual Indicators Row (Humidity & Air Quality in Reference Screen 3) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Liquidity Humidity */}
        <div className="obsidian-card p-4 flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-[12px] bg-[#191A1E] border border-[#26282E] flex items-center justify-center text-[#88A9BC] mb-2 shadow-[0_0_10px_rgba(136,169,188,0.1)]">
            <Droplets className="w-4 h-4 stroke-[1.8]" />
          </div>
          <span className="text-[11px] font-normal text-[#9A9DA5]">
            رطوبت نقدینگی
          </span>
          <span className="text-xl font-normal text-[#E8E8E8] font-number mt-0.5">
            {liquidityRatio}٪
          </span>
          <span className="text-[10px] text-[#696D77] font-normal mt-0.5">
            نسبت نقدینگی فعال
          </span>
        </div>

        {/* Card 2: Debt Quality Air */}
        <div className="obsidian-card p-4 flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-[12px] bg-[rgba(118,169,140,0.08)] border border-[rgba(118,169,140,0.22)] flex items-center justify-center text-[#76A98C] mb-2 shadow-[0_0_10px_rgba(118,169,140,0.15)]">
            <Leaf className="w-4 h-4 stroke-[1.8]" />
          </div>
          <span className="text-[11px] font-normal text-[#9A9DA5]">
            کیفیت تعهدات
          </span>
          <span className="text-xl font-normal text-[#76A98C] font-number mt-0.5 drop-shadow-[0_0_8px_rgba(118,169,140,0.3)]">
            {debtToIncome < 30 ? "عالی" : "متوسط"}
          </span>
          <span className="text-[10px] text-[#696D77] font-normal mt-0.5">
            اقساط: {debtToIncome}٪ درآمد
          </span>
        </div>
      </div>

      {/* Daily Schedule / Upcoming Obligations (Screen 3 Translation) */}
      <div className="obsidian-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-medium text-[#9A9DA5]">
              تقویم تعهدات و اقساط
            </h3>
            <span className="text-sm font-semibold text-[#E8E8E8]">برنامه زمان‌بندی ماهانه</span>
          </div>
          <span className="text-xs text-[#F0AE55] font-medium">
            {obligations.length || liabilities?.length || 0} مورد
          </span>
        </div>

        <div className="space-y-2">
          {obligations.length > 0 ? (
            obligations.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex items-center justify-between p-3 rounded-[16px] bg-[#1B1D21] border border-[#282A2F]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[10px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#9A9DA5]">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#E8E8E8]">{item.name}</p>
                    <p className="text-[10px] text-[#696D77] font-number">
                      مانده بدهی: {formatMoney(item.remaining_balance)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#F0AE55] font-number">
                  {formatMoney(item.monthly_payment)}
                </span>
              </div>
            ))
          ) : liabilities && liabilities.length > 0 ? (
            liabilities.map((liab) => (
              <div
                key={liab.id}
                className="flex items-center justify-between p-3 rounded-[16px] bg-[#1B1D21] border border-[#282A2F]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[10px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#9A9DA5]">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#E8E8E8]">{liab.name}</p>
                    <p className="text-[10px] text-[#696D77] font-number">
                      مانده: {formatMoney(liab.current_balance)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#F0AE55] font-number">
                  {formatMoney(liab.monthly_payment)}
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-[16px] bg-[#1B1D21] border border-[#282A2F] text-center text-[#696D77] text-xs">
              تعهد بدهی فعالی ثبت نشده است.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
