"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Power, Sparkles, RefreshCw, Layers, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CapsuleSlider } from "@/components/mobile/capsule-slider";
import { ColorTempSlider } from "@/components/mobile/color-temp-slider";
import { EditPositionModal } from "@/components/mobile/edit-position-modal";
import { QuickTransactionModal } from "@/components/mobile/transaction-modal";
import { useCurrency } from "@/components/currency-context";
import { useAuth } from "@/components/auth-context";
import { api } from "@/lib/api";
import { AssetPosition } from "@/types/financial";

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
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Position editing modal state
  const [selectedPosition, setSelectedPosition] = useState<AssetPosition | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

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
      const ps = user.portfolio_suggestion as Record<string, number | boolean>;
      const inv = Number(ps.investment ?? ps.stocks ?? 70);
      const liq = Number(ps.liquid ?? ps.cash ?? 30);
      const risk = Number(ps.risk_tolerance ?? 65);
      const autoRebal = typeof ps.auto_rebalance === "boolean" ? ps.auto_rebalance : true;

      setInvestAllocation(inv);
      setLiquidAllocation(liq);
      setRiskTolerance(risk);
      setIsAutoRebalance(autoRebal);
    }
  }, [user]);

  // Update allocation on backend
  const handleSaveAllocation = async () => {
    setIsSaving(true);
    setSaveToast(null);
    try {
      await api.updateProfile({
        portfolio_suggestion: {
          investment: investAllocation,
          liquid: liquidAllocation,
          risk_tolerance: riskTolerance,
          auto_rebalance: isAutoRebalance,
        },
      });
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["analytics-overview"] });
      queryClient.invalidateQueries({ queryKey: ["asset-positions"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      setSaveToast("تنظیمات تخصیص سبد دارایی با موفقیت در سرور ذخیره شد.");
      setTimeout(() => setSaveToast(null), 3500);
    } catch (e) {
      console.error("Failed to update profile allocation:", e);
      setSaveToast("خطا در ذخیره تخصیص در سرور");
      setTimeout(() => setSaveToast(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const totalAssetsNum = overview?.total_assets ? parseFloat(overview.total_assets) : 0;
  const netWorthNum = overview?.net_worth ? parseFloat(overview.net_worth) : 0;

  return (
    <div className="space-y-5">
      {/* Top Header with Back Arrow */}
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
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#F0AE55] active:scale-95 transition-colors cursor-pointer"
          title="به‌روزرسانی از سرور"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isPositionsLoading || isOverviewLoading ? "animate-spin text-[#F0AE55]" : ""
            }`}
          />
        </button>
      </div>

      {/* Visual Ambient Banner */}
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
              {formatMoney(totalAssetsNum || netWorthNum)}
            </span>
          </p>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="p-2.5 rounded-[12px] bg-[#141518] border border-[rgba(240,174,85,0.3)] text-center text-xs text-[#F0AE55] animate-in fade-in">
          {saveToast}
        </div>
      )}

      {/* Tactile Sliders + Power Toggle Pill */}
      <div className="flex items-center gap-3 w-full">
        {/* Slider 1: Investment Assets */}
        <CapsuleSlider
          value={investAllocation}
          label="سرمایه‌گذاری"
          sublabel="سهام و طلا"
          onChange={setInvestAllocation}
          height={240}
        />

        {/* Slider 2: Liquidity Reserve */}
        <CapsuleSlider
          value={liquidAllocation}
          label="ذخیره امن"
          sublabel="نقدینگی و بانکی"
          onChange={setLiquidAllocation}
          height={240}
        />

        {/* Right Power Toggle Pill */}
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={() => setIsAutoRebalance(!isAutoRebalance)}
            style={{ height: 240 }}
            className={`w-[74px] rounded-[28px] border flex flex-col items-center justify-between py-5 px-1 transition-all duration-150 active:scale-95 cursor-pointer ${
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

      {/* Horizontal Color Temperature / Risk Slider */}
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

      {/* Save Button */}
      <button
        onClick={handleSaveAllocation}
        disabled={isSaving}
        className="w-full py-3.5 rounded-[16px] btn-illuminated-amber font-medium text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
        <span>{isSaving ? "در حال ذخیره در سرور..." : "ذخیره و اعمال بازتوزیع"}</span>
      </button>

      {/* Real Backend Positions List */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-medium text-[#9A9DA5]">
            موقعیت‌های باز واقعی از سرور
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#F0AE55] font-medium font-number">
              {positions?.length || 0} موقعیت
            </span>
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="text-[11px] text-[#76A98C] font-medium hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>خرید جدید</span>
            </button>
          </div>
        </div>

        {positions && positions.length > 0 ? (
          <div className="space-y-2">
            {positions.map((pos) => (
              <div
                key={pos.id}
                onClick={() => setSelectedPosition(pos)}
                className="obsidian-card p-3 flex items-center justify-between cursor-pointer active:scale-98 transition-all hover:border-[rgba(240,174,85,0.25)]"
                title="جهت ویرایش حجم یا بهای خرید کلیک کنید"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[12px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#9A9DA5]">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#E8E8E8]">
                      {pos.asset_name || pos.asset_symbol}
                    </p>
                    <p className="text-[10px] text-[#696D77] font-number">
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
                    {parseFloat(pos.unrealized_pnl) >= 0 ? "+" : ""}
                    {pos.unrealized_pnl_percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-[22px] bg-[#141518] border border-[#282A2F] text-center text-[#696D77] text-xs space-y-2">
            <p>
              {isPositionsLoading
                ? "در حال بارگذاری موقعیت‌ها از سرور..."
                : "موقعیتی در سبد دارایی ثبت نشده است."}
            </p>
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="px-3 py-1.5 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] text-xs font-medium inline-flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ثبت خرید دارایی</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Position Modal */}
      <EditPositionModal
        position={selectedPosition}
        isOpen={!!selectedPosition}
        onClose={() => setSelectedPosition(null)}
      />

      {/* Buy Asset Transaction Modal */}
      <QuickTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />
    </div>
  );
}
