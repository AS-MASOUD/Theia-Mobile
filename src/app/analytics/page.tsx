"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Activity,
  PieChart,
  RefreshCw,
  Clock,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Percent,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { HistoricalSnapshot, OverviewDashboard } from "@/types/financial";

export default function MobileAnalyticsPage() {
  const { formatMoney } = useCurrency();
  const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState<number | null>(null);

  const { data: snapshots, isLoading: isSnapshotsLoading, refetch } = useQuery<HistoricalSnapshot[]>({
    queryKey: ["mobile-analytics-snapshots"],
    queryFn: () => api.getSnapshots(90),
  });

  const { data: overview, isLoading: isOverviewLoading } = useQuery<OverviewDashboard>({
    queryKey: ["mobile-analytics-overview"],
    queryFn: () => api.getOverview(),
  });

  // Authoritative financial ratios matching desktop formulas
  const totalAssets = parseFloat(overview?.total_assets || "0");
  const totalLiabilities = parseFloat(overview?.total_liabilities || "0");
  const liquidCash = parseFloat(overview?.liquid_cash || "0");
  const monthlyIncome = parseFloat(overview?.monthly_income || "0");
  const monthlyExpenses = parseFloat(overview?.monthly_expenses || "0");
  const monthlyDebt = parseFloat(overview?.monthly_debt_service || "0");

  const debtToAsset = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const liquidRatio = totalAssets > 0 ? (liquidCash / totalAssets) * 100 : 0;
  const debtServiceRatio = monthlyIncome > 0 ? (monthlyDebt / monthlyIncome) * 100 : 0;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  const runwayMonths = monthlyExpenses > 0 ? (liquidCash / monthlyExpenses).toFixed(1) : "0";

  // Mathematical SVG chart for 90-day Net Worth & Assets
  const chartGeometry = useMemo(() => {
    if (!snapshots || snapshots.length < 2) return null;

    const sorted = [...snapshots].sort(
      (a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
    );

    const nwValues = sorted.map((s) => parseFloat(s.net_worth) || 0);
    const assetValues = sorted.map((s) => parseFloat(s.total_assets) || 0);

    const allValues = [...nwValues, ...assetValues];
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal || 1;

    const width = 340;
    const height = 150;
    const paddingX = 10;
    const paddingY = 15;

    const nwPoints = sorted.map((s, i) => {
      const x = paddingX + (i / (sorted.length - 1)) * (width - 2 * paddingX);
      const val = parseFloat(s.net_worth) || 0;
      const y = height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);
      return { x, y, snapshot: s, index: i };
    });

    const assetPoints = sorted.map((s, i) => {
      const x = paddingX + (i / (sorted.length - 1)) * (width - 2 * paddingX);
      const val = parseFloat(s.total_assets) || 0;
      const y = height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);
      return { x, y };
    });

    const makePath = (pts: { x: number; y: number }[]) =>
      pts.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, "");

    const nwLine = makePath(nwPoints);
    const assetLine = makePath(assetPoints);

    return {
      width,
      height,
      sorted,
      nwPoints,
      nwLine,
      assetLine,
    };
  }, [snapshots]);

  const activeSnapshot = useMemo(() => {
    if (!chartGeometry?.sorted.length) return null;
    if (selectedSnapshotIndex !== null && chartGeometry.sorted[selectedSnapshotIndex]) {
      return chartGeometry.sorted[selectedSnapshotIndex];
    }
    return chartGeometry.sorted[chartGeometry.sorted.length - 1] || null;
  }, [chartGeometry, selectedSnapshotIndex]);

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href="/"
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>

        <div className="text-center">
          <h1 className="text-sm font-semibold text-[#E8E8E8]">تحلیل‌های مالی و سلامت ترازنامه</h1>
          <p className="text-[10px] text-[#F0AE55] font-medium uppercase tracking-wider">
            Financial Health Ratios
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors"
          title="بروزرسانی داده‌ها"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 90-Day Expansion Chart */}
      <div className="p-4 rounded-[22px] bg-[#141518] border border-[#282A2F] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#E8E8E8] flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#F0AE55]" />
            <span>روند ۹۰ روزه ارزش خالص و دارایی‌ها</span>
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-[#F0AE55]">
              <span className="w-2 h-0.5 bg-[#F0AE55] rounded" />
              <span>ارزش خالص</span>
            </span>
            <span className="flex items-center gap-1 text-[#76A98C]">
              <span className="w-2 h-0.5 bg-[#76A98C] rounded" />
              <span>دارایی کل</span>
            </span>
          </div>
        </div>

        {isSnapshotsLoading ? (
          <div className="h-40 flex items-center justify-center text-xs text-[#9A9DA5]">
            در حال بارگذاری سوابق اسنپ‌شات‌ها...
          </div>
        ) : chartGeometry ? (
          <div>
            <svg
              viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
              className="w-full h-40 overflow-visible"
            >
              {/* Asset Line */}
              <path
                d={chartGeometry.assetLine}
                fill="none"
                stroke="#76A98C"
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeOpacity="0.8"
              />

              {/* Net Worth Line */}
              <path
                d={chartGeometry.nwLine}
                fill="none"
                stroke="#F0AE55"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Touch interaction dots */}
              {chartGeometry.nwPoints.map((p) => (
                <circle
                  key={p.index}
                  cx={p.x}
                  cy={p.y}
                  r={selectedSnapshotIndex === p.index ? 5.5 : 2.5}
                  fill={selectedSnapshotIndex === p.index ? "#F0AE55" : "#A0A3AD"}
                  stroke="#0D0E10"
                  strokeWidth="1.5"
                  className="cursor-pointer hover:scale-125"
                  onClick={() => setSelectedSnapshotIndex(p.index)}
                />
              ))}
            </svg>

            {activeSnapshot && (
              <div className="mt-2 pt-2 border-t border-[#282A2F]/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#9A9DA5] block">
                    تاریخ: {formatDate(activeSnapshot.snapshot_date)}
                  </span>
                  <span className="font-semibold text-[#F0AE55] font-mono tabular-nums">
                    ارزش خالص: {formatMoney(parseFloat(activeSnapshot.net_worth))}
                  </span>
                </div>
                <div className="text-left font-mono text-[11px] text-[#76A98C]">
                  دارایی کل: {formatMoney(parseFloat(activeSnapshot.total_assets))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-xs text-[#9A9DA5]">
            سوابق کافی برای ترسیم نمودار یافت نشد.
          </div>
        )}
      </div>

      {/* Financial Health Indicators Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Ratio 1: Debt to Asset */}
        <div className="p-4 rounded-[20px] bg-[#141518] border border-[#282A2F] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#9A9DA5]">
            <span>نسبت بدهی به دارایی</span>
            <Activity className="w-3.5 h-3.5 text-[#C77A82]" />
          </div>
          <div
            className={`text-lg font-bold font-mono ${
              debtToAsset > 50 ? "text-[#C77A82]" : "text-[#E8E8E8]"
            }`}
          >
            {debtToAsset.toFixed(1)}%
          </div>
          <span className="text-[10px] text-[#9A9DA5] block">
            {debtToAsset < 35 ? "اهرم مالی بسیار ایمن" : "اهرم مالی متعادل"}
          </span>
        </div>

        {/* Ratio 2: Liquidity Adequacy */}
        <div className="p-4 rounded-[20px] bg-[#141518] border border-[#282A2F] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#9A9DA5]">
            <span>کفایت نقدینگی</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#76A98C]" />
          </div>
          <div className="text-lg font-bold text-[#76A98C] font-mono">
            {liquidRatio.toFixed(1)}%
          </div>
          <span className="text-[10px] text-[#9A9DA5] block">
            سهم وجه نقد از کل دارایی
          </span>
        </div>

        {/* Ratio 3: Debt Service Coverage */}
        <div className="p-4 rounded-[20px] bg-[#141518] border border-[#282A2F] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#9A9DA5]">
            <span>فشار اقساط به درآمد</span>
            <Percent className="w-3.5 h-3.5 text-[#F0AE55]" />
          </div>
          <div
            className={`text-lg font-bold font-mono ${
              debtServiceRatio > 40 ? "text-[#C77A82]" : "text-[#E8E8E8]"
            }`}
          >
            {debtServiceRatio.toFixed(1)}%
          </div>
          <span className="text-[10px] text-[#9A9DA5] block">
            {debtServiceRatio < 30 ? "فشار پرداخت کاملاً مجاز" : "فشار پرداخت متوسط"}
          </span>
        </div>

        {/* Ratio 4: Emergency Runway */}
        <div className="p-4 rounded-[20px] bg-[#141518] border border-[#282A2F] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#9A9DA5]">
            <span>بافر صندوق اضطراری</span>
            <Clock className="w-3.5 h-3.5 text-[#F0AE55]" />
          </div>
          <div className="text-lg font-bold text-[#E8E8E8] font-mono">
            {runwayMonths} ماه
          </div>
          <span className="text-[10px] text-[#9A9DA5] block">
            پوشش هزینه‌های ضروری زندگی
          </span>
        </div>
      </div>

      {/* Commentary & Health Diagnosis Card */}
      <div className="p-4 rounded-[22px] bg-[#141518] border border-[#282A2F] space-y-2.5">
        <h3 className="text-xs font-semibold text-[#E8E8E8] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F0AE55]" />
          <span>جمع‌بندی تحلیلی وضعیت مالی تئا</span>
        </h3>
        <p className="text-[11px] text-[#9A9DA5] leading-relaxed">
          ساختار ترازنامه شما دارای نرخ پس‌انداز ماهانه {savingsRate.toFixed(0)}٪ و پوشش ذخیره امن {runwayMonths} ماه است. برای ارتقای تاب‌آوری، اولویت با حفظ تعادل اهرم بدهی در محدوده زیر ۳۵ درصد و تخصیص منظم به دارایی‌های دارای جریان نقدی است.
        </p>
      </div>
    </div>
  );
}
