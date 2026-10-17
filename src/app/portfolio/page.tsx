"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Power, Sparkles, RefreshCw, Layers } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CapsuleSlider } from "@/components/mobile/capsule-slider";
import { ColorTempSlider } from "@/components/mobile/color-temp-slider";
import { useCurrency } from "@/components/currency-context";
import { useAuth } from "@/components/auth-context";
import { api } from "@/lib/api";

export default function MobilePortfolioPage() {
  const { formatMoney } = useCurrency();
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  // Primary allocation values (Minimalist 2-capsule layout matching reference Screen 2)
  const [investAllocation, setInvestAllocation] = useState(70);
  const [liquidAllocation, setLiquidAllocation] = useState(30);
  const [isAutoRebalance, setIsAutoRebalance] = useState(true);
  const [riskTolerance, setRiskTolerance] = useState(65);
  const [isSaving, setIsSaving] = useState(false);

  // Real backend queries
  const { data: positions, isLoading: isPositionsLoading } = useQuery({
    queryKey: ["asset-positions"],
    queryFn: () => api.getPositions(),
  });

  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => api.getOverview(),
  });

  // Sync with user's saved portfolio suggestion from backend
  useEffect(() => {
    if (user?.portfolio_suggestion) {
      const ps = user.portfolio_suggestion;
      const stocks = ps.stocks || ps.investment || 40;
      const gold = ps.gold || 30;
      const cash = ps.cash || ps.liquid || 30;
      setInvestAllocation(stocks + gold);
      setLiquidAllocation(cash);
    }
  }, [user]);

  // Update allocation on backend
  const handleSaveAllocation = async () => {
    setIsSaving(true);
    try {
      await api.updateProfile({
        portfolio_suggestion: {
          investment: investAllocation,
          liquid: liquidAllocation,
          risk_tolerance: riskTolerance,
        },
      });
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["analytics-overview"] });
      queryClient.invalidateQueries({ queryKey: ["asset-positions"] });
    } catch (e) {
      console.error("Failed to update profile allocation:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const totalAssetsNum = overview?.total_assets ? parseFloat(overview.total_assets) : 0;
  const netWorthNum = overview?.net_worth ? parseFloat(overview.net_worth) : 0;

  return (
    <div className="space-y-5">
      {/* Top Header with Back Arrow (Screen 2 Inspiration) */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href="/"
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>

        <span className="text-[11px] font-medium text-[#F0AE55] bg-[rgba(240,174,85,0.09)] px-3 py-0.5 rounded-full border border-[rgba(240,174,85,0.22)]">
          تخصیص سبد دارایی
        </span>

        <button
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["analytics-overview"] });
            queryClient.invalidateQueries({ queryKey: ["asset-positions"] });
          }}
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#F0AE55] active:scale-95 transition-colors"
          title="به‌روزرسانی از سرور"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPositionsLoading || isOverviewLoading ? "animate-spin text-[#F0AE55]" : ""}`} />
        </button>
      </div>

      {/* Visual Ambient Banner (Minimalist & Calm) */}
      <div className="obsidian-card p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle,rgba(240,174,85,0.09)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#F0AE55] mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F0AE55] shadow-[0_0_6px_rgba(240,174,85,0.8)]" />
            <span>مدل تئا • پورتفولیو بهینه</span>
          </div>
          <h1 className="text-lg font-semibold text-[#E8E8E8] tracking-tight">
            حالت تعادلی (Ambient Mode)
          </h1>
          <p className="text-xs text-[#9A9DA5] mt-1">
            مجموع دارایی تحت مدیریت:{" "}
            <span className="text-[#F0AE55] font-medium font-number">
              {formatMoney(totalAssetsNum || netWorthNum || 845000000)}
            </span>
          </p>
        </div>
      </div>

      {/* EXACT Screen 2 Layout: TWO Spacious Sliders + ONE Power Toggle Pill */}
      <div className="flex items-center gap-3 w-full">
        {/* Slider 1: Investment Assets (CEILING in screenshot) */}
        <CapsuleSlider
          value={investAllocation}
          label="سرمایه‌گذاری"
          sublabel="سهام و طلا"
          onChange={setInvestAllocation}
          height={240}
        />

        {/* Slider 2: Liquidity Reserve (FLOOR in screenshot) */}
        <CapsuleSlider
          value={liquidAllocation}
          label="ذخیره امن"
          sublabel="نقدینگی و بانکی"
          onChange={setLiquidAllocation}
          height={240}
        />

        {/* Right Power Toggle Pill (OFF/ON in screenshot) */}
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={() => setIsAutoRebalance(!isAutoRebalance)}
            style={{ height: 240 }}
            className={`w-[74px] rounded-[28px] border flex flex-col items-center justify-between py-5 px-1 transition-all duration-150 active:scale-95 ${
              isAutoRebalance
                ? "bg-[#18191E] border-[rgba(240,174,85,0.35)] shadow-[0_0_16px_rgba(240,174,85,0.12),inset_0_2px_6px_rgba(0,0,0,0.5)]"
                : "bg-[#15161A] border-[#26282E]"
            }`}
          >
            {/* Amber Power Knob with ambient halo */}
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isAutoRebalance
                  ? "bg-[#F0AE55] text-[#0D0E10] shadow-[0_0_16px_rgba(240,174,85,0.48)]"
                  : "bg-[#222327] text-[#696D77]"
              }`}
            >
              <Power className="w-4 h-4 stroke-[2]" />
            </div>

            {/* Label at bottom of power pill */}
            <div className="text-center pointer-events-none">
              <span
                className={`text-xs font-semibold uppercase tracking-wider block ${
                  isAutoRebalance
                    ? "text-[#F0AE55] drop-shadow-[0_0_6px_rgba(240,174,85,0.35)]"
                    : "text-[#696D77]"
                }`}
              >
                {isAutoRebalance ? "روشن" : "خاموش"}
              </span>
              <span className="text-[9px] text-[#696D77] mt-0.5 block">
                تعدیل
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Horizontal Color Temperature / Risk Slider (Screen 2) */}
      <ColorTempSlider
        value={riskTolerance}
        onChange={setRiskTolerance}
        title="دمای افق سرمایه‌گذاری و ریسک"
        leftLabel="محافظه‌کار (پایداری)"
        rightLabel="رشد سریع (پویایی)"
        activeLabel={
          riskTolerance > 70
            ? "پویا (رشد)"
            : riskTolerance < 40
            ? "کم‌ریسک (سپر)"
            : "تعادل طلایی"
        }
      />

      {/* Save Button (Reference Screen 6: Soft Glowing ACTIVATE Button) */}
      <button
        onClick={handleSaveAllocation}
        disabled={isSaving}
        className="w-full py-3.5 rounded-[16px] btn-illuminated-amber font-medium text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
        <span>{isSaving ? "در حال ذخیره در سرور..." : "ذخیره و اعمال بازتوزیع"}</span>
      </button>

      {/* Real Backend Positions List (If positions exist) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-medium text-[#9A9DA5]">
            موقعیت‌های باز واقعی از سرور
          </h2>
          <span className="text-[11px] text-[#F0AE55] font-medium font-number">
            {positions?.length || 0} موقعیت
          </span>
        </div>

        {positions && positions.length > 0 ? (
          <div className="space-y-2">
            {positions.map((pos) => (
              <div
                key={pos.id}
                className="obsidian-card p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[12px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#9A9DA5]">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#E8E8E8]">
                      {pos.asset_name || pos.asset_symbol}
                    </p>
                    <p className="text-[10px] text-[#696D77]">
                      تعداد: {pos.quantity} • {pos.asset_class}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-xs font-medium text-[#E8E8E8] font-number block">
                    {formatMoney(pos.current_value)}
                  </span>
                  <span
                    className={`text-[10px] font-medium font-number ${
                      parseFloat(pos.unrealized_pnl) >= 0
                        ? "text-[#76A98C]"
                        : "text-[#C77A82]"
                    }`}
                  >
                    {pos.unrealized_pnl_percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-[22px] bg-[#141518] border border-[#282A2F] text-center text-[#696D77] text-xs">
            {isPositionsLoading
              ? "در حال بارگذاری موقعیت‌ها از سرور..."
              : "موقعیتی در سبد دارایی ثبت نشده است. از منوی ثبت تراکنش دارایی جدید اضافه کنید."}
          </div>
        )}
      </div>
    </div>
  );
}
