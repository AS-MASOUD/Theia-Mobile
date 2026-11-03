"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  Wallet,
  Coins,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  WealthTrajectoryResponse,
  TrajectoryTimelinePoint,
  LoanTrajectoryItem,
  InvestmentTrajectoryItem,
} from "@/types/financial";

interface RangeOption {
  key: string;
  label: string;
  historyDays: number;
  forecastMonths: number;
}

const RANGE_OPTIONS: RangeOption[] = [
  { key: "1M", label: "۱ ماه", historyDays: 30, forecastMonths: 1 },
  { key: "3M", label: "۳ ماه", historyDays: 90, forecastMonths: 3 },
  { key: "6M", label: "۶ ماه", historyDays: 180, forecastMonths: 6 },
  { key: "1Y", label: "۱ سال", historyDays: 365, forecastMonths: 12 },
  { key: "2Y", label: "۲ سال", historyDays: 365, forecastMonths: 24 },
  { key: "5Y", label: "۵ سال", historyDays: 365, forecastMonths: 60 },
];

export default function MobileWealthTrajectoryPage() {
  const { formatMoney } = useCurrency();
  const [selectedRangeKey, setSelectedRangeKey] = useState<string>("1Y");
  const [growthOverride, setGrowthOverride] = useState<number | null>(null);
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chart" | "loans" | "assets" | "milestones">("chart");
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  const currentRange = useMemo(
    () => RANGE_OPTIONS.find((r) => r.key === selectedRangeKey) || RANGE_OPTIONS[3],
    [selectedRangeKey]
  );

  const { data: trajectory, isLoading, refetch } = useQuery<WealthTrajectoryResponse>({
    queryKey: [
      "mobile-wealth-trajectory",
      currentRange.historyDays,
      currentRange.forecastMonths,
      growthOverride,
    ],
    queryFn: () =>
      api.getWealthTrajectory({
        history_days: currentRange.historyDays,
        forecast_months: currentRange.forecastMonths,
        annual_growth_override: growthOverride !== null ? growthOverride : undefined,
      }),
  });

  const timeline = trajectory?.timeline || [];

  // Find split index between historical and forecast
  const todayIndex = useMemo(() => {
    const idx = timeline.findIndex((p) => p.is_forecast);
    return idx === -1 ? timeline.length - 1 : Math.max(0, idx - 1);
  }, [timeline]);

  // Active inspected point
  const activePoint: TrajectoryTimelinePoint | null = useMemo(() => {
    if (!timeline.length) return null;
    if (selectedPointIndex !== null && timeline[selectedPointIndex]) {
      return timeline[selectedPointIndex];
    }
    return timeline[timeline.length - 1] || null;
  }, [timeline, selectedPointIndex]);

  // Mathematical SVG path generator for the timeline points
  const chartGeometry = useMemo(() => {
    if (timeline.length < 2) return null;

    const values = timeline.map((p) => parseFloat(String(p.net_worth)) || 0);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const width = 340;
    const height = 160;
    const paddingX = 10;
    const paddingY = 15;

    const points = timeline.map((p, i) => {
      const x = paddingX + (i / (timeline.length - 1)) * (width - 2 * paddingX);
      const val = parseFloat(String(p.net_worth)) || 0;
      const y = height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);
      return { x, y, point: p, index: i };
    });

    // Historic slice vs Forecast slice
    const histPoints = points.slice(0, todayIndex + 1);
    const forePoints = points.slice(todayIndex);

    const makePath = (pts: typeof points) => {
      if (!pts.length) return "";
      return pts.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, "");
    };

    const histLine = makePath(histPoints);
    const foreLine = makePath(forePoints);

    // Area path
    const areaPath = `M ${points[0].x} ${height} ` +
      points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
      ` L ${points[points.length - 1].x} ${height} Z`;

    const todayX = points[todayIndex]?.x || (width / 2);

    return {
      width,
      height,
      points,
      histLine,
      foreLine,
      areaPath,
      todayX,
      minVal,
      maxVal,
    };
  }, [timeline, todayIndex]);

  // Key summary numbers
  const currentNw = timeline.length > 0 ? parseFloat(String(timeline[0].net_worth)) : 0;
  const projectedNw = timeline.length > 0 ? parseFloat(String(timeline[timeline.length - 1].net_worth)) : 0;
  const growthPct = currentNw > 0 ? (((projectedNw - currentNw) / currentNw) * 100).toFixed(1) : "0";
  const baselineRate = 20;

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
          <h1 className="text-sm font-semibold text-[#E8E8E8]">مسیر ثروت و چشم‌انداز</h1>
          <p className="text-[10px] text-[#F0AE55] font-medium uppercase tracking-wider">
            Wealth Trajectory & Forecast
          </p>
        </div>

        <button
          onClick={() => setIsSimOpen(!isSimOpen)}
          className={`w-9 h-9 rounded-[14px] flex items-center justify-center transition-all ${
            isSimOpen
              ? "bg-[#F0AE55] text-[#0D0E10]"
              : "bg-[#141518] border border-[#282A2F] text-[#696D77] hover:text-[#E8E8E8]"
          }`}
          title="تنظیمات شبیه‌سازی رشد"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Primary KPI Card */}
      <div className="p-4 rounded-[22px] obsidian-card border-[rgba(240,174,85,0.25)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#9A9DA5] block">
              چشم‌انداز خالص ثروت در افق {currentRange.label}
            </span>
            <div className="text-xl font-bold text-[#E8E8E8] font-mono tabular-nums tracking-tight mt-0.5">
              {formatMoney(projectedNw)}
            </div>
          </div>

          <div className="text-left">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-xs font-mono font-bold ${
                parseFloat(growthPct) >= 0
                  ? "bg-[#76A98C]/15 text-[#76A98C] border border-[#76A98C]/30"
                  : "bg-[#C77A82]/15 text-[#C77A82] border border-[#C77A82]/30"
              }`}
              dir="ltr"
            >
              {parseFloat(growthPct) >= 0 ? "+" : ""}
              {growthPct}%
            </span>
            <span className="text-[10px] text-[#9A9DA5] block mt-0.5">
              نرخ رشد: {growthOverride !== null ? `${growthOverride}% (دستی)` : `${baselineRate}%`}
            </span>
          </div>
        </div>

        {/* Range Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => {
                setSelectedRangeKey(r.key);
                setSelectedPointIndex(null);
              }}
              className={`flex-1 py-1.5 px-2 rounded-[10px] text-[11px] font-medium text-center transition-all ${
                selectedRangeKey === r.key
                  ? "bg-[#F0AE55] text-[#0D0E10] font-semibold shadow-[0_0_10px_rgba(240,174,85,0.3)]"
                  : "bg-[#141518] text-[#9A9DA5] border border-[#282A2F] hover:text-[#E8E8E8]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Growth Override Drawer/Section */}
      {isSimOpen && (
        <div className="p-4 rounded-[20px] bg-[#141518] border border-[rgba(240,174,85,0.3)] space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-[#E8E8E8]">
            <span className="flex items-center gap-1.5 text-[#F0AE55]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تنظیم فرضیه نرخ بازده سالانه</span>
            </span>
            {growthOverride !== null && (
              <button
                onClick={() => setGrowthOverride(null)}
                className="flex items-center gap-1 text-[11px] text-[#9A9DA5] hover:text-[#E8E8E8]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>بازنشانی پیش‌فرض ({baselineRate}%)</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#9A9DA5] font-mono">
              <span>۵٪ (محتاط)</span>
              <span className="text-[#F0AE55] font-bold">
                {growthOverride !== null ? `${growthOverride}٪` : `${baselineRate}٪`}
              </span>
              <span>۵۰٪ (تهاجمی)</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={growthOverride !== null ? growthOverride : baselineRate}
              onChange={(e) => setGrowthOverride(Number(e.target.value))}
              className="w-full accent-[#F0AE55] bg-[#282A2F] rounded-lg h-2 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Interactive Responsive Chart Card */}
      <div className="p-4 rounded-[22px] bg-[#141518] border border-[#282A2F] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#9A9DA5]">
              <span className="w-2.5 h-0.5 bg-[#76A98C] rounded" />
              <span>تاریخچه</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#9A9DA5]">
              <span className="w-2.5 h-0.5 bg-[#F0AE55] rounded border-b border-dashed" />
              <span>پیش‌بینی</span>
            </span>
          </div>

          {activePoint && (
            <div className="text-[11px] text-[#A0A3AD] font-mono" dir="ltr">
              {formatDate(activePoint.date)}
            </div>
          )}
        </div>

        {/* SVG Canvas with Touch Points */}
        {isLoading ? (
          <div className="h-44 flex items-center justify-center text-xs text-[#9A9DA5]">
            در حال پردازش مسیر ریاضی ثروت...
          </div>
        ) : chartGeometry ? (
          <div className="relative">
            <svg
              viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
              className="w-full h-44 overflow-visible"
            >
              <defs>
                <linearGradient id="trajGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F0AE55" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F0AE55" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Shading */}
              <path d={chartGeometry.areaPath} fill="url(#trajGradient)" />

              {/* Today Vertical Separator */}
              <line
                x1={chartGeometry.todayX}
                y1="10"
                x2={chartGeometry.todayX}
                y2={chartGeometry.height - 10}
                stroke="#282A2F"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />

              {/* Historical Solid Line */}
              {chartGeometry.histLine && (
                <path
                  d={chartGeometry.histLine}
                  fill="none"
                  stroke="#76A98C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Forecast Dashed Line */}
              {chartGeometry.foreLine && (
                <path
                  d={chartGeometry.foreLine}
                  fill="none"
                  stroke="#F0AE55"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              )}

              {/* Touch interaction dots */}
              {chartGeometry.points.map((p) => {
                const isSelected = selectedPointIndex === p.index;
                const isToday = p.index === todayIndex;
                if (!isSelected && !isToday && p.index % Math.max(1, Math.floor(chartGeometry.points.length / 8)) !== 0) {
                  return null;
                }
                return (
                  <circle
                    key={p.index}
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 6 : isToday ? 4.5 : 3}
                    fill={isSelected ? "#F0AE55" : isToday ? "#E8E8E8" : "#9A9DA5"}
                    stroke="#0D0E10"
                    strokeWidth="2"
                    className="cursor-pointer transition-all hover:scale-125"
                    onClick={() => setSelectedPointIndex(p.index)}
                  />
                );
              })}
            </svg>

            {/* Active Point Card Details */}
            {activePoint && (
              <div className="mt-2 pt-2.5 border-t border-[#282A2F]/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#9A9DA5] block">
                    {activePoint.is_forecast ? "نقطه پیش‌بینی" : "نقطه واقعی"}
                  </span>
                  <span className="font-semibold text-[#E8E8E8] font-mono tabular-nums">
                    {formatMoney(parseFloat(String(activePoint.net_worth)) || 0)}
                  </span>
                </div>
                <div className="text-left font-mono text-[11px] space-y-0.5">
                  <div className="text-[#76A98C]">دارایی: {formatMoney((parseFloat(String(activePoint.total_investments)) || 0) + (parseFloat(String(activePoint.liquid_cash)) || 0))}</div>
                  <div className="text-[#C77A82]">بدهی: {formatMoney(parseFloat(String(activePoint.total_liabilities)) || 0)}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-44 flex items-center justify-center text-xs text-[#9A9DA5]">
            داده‌ای برای ترسیم نمودار یافت نشد.
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 bg-[#141518] p-1 rounded-[14px] border border-[#282A2F] text-xs">
        <button
          onClick={() => setActiveTab("chart")}
          className={`flex-1 py-1.5 rounded-[10px] font-medium transition-all ${
            activeTab === "chart"
              ? "bg-[#F0AE55]/15 text-[#F0AE55] font-semibold"
              : "text-[#9A9DA5] hover:text-[#E8E8E8]"
          }`}
        >
          خلاصه تحلیل
        </button>
        <button
          onClick={() => setActiveTab("loans")}
          className={`flex-1 py-1.5 rounded-[10px] font-medium transition-all ${
            activeTab === "loans"
              ? "bg-[#F0AE55]/15 text-[#F0AE55] font-semibold"
              : "text-[#9A9DA5] hover:text-[#E8E8E8]"
          }`}
        >
          مسیر وام‌ها ({trajectory?.loans?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`flex-1 py-1.5 rounded-[10px] font-medium transition-all ${
            activeTab === "assets"
              ? "bg-[#F0AE55]/15 text-[#F0AE55] font-semibold"
              : "text-[#9A9DA5] hover:text-[#E8E8E8]"
          }`}
        >
          دارایی‌ها ({trajectory?.investments?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("milestones")}
          className={`flex-1 py-1.5 rounded-[10px] font-medium transition-all ${
            activeTab === "milestones"
              ? "bg-[#F0AE55]/15 text-[#F0AE55] font-semibold"
              : "text-[#9A9DA5] hover:text-[#E8E8E8]"
          }`}
        >
          نقاط عطف
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "chart" && (
        <div className="space-y-3">
          <div className="p-4 rounded-[20px] bg-[#141518] border border-[#282A2F] space-y-2">
            <h3 className="text-xs font-semibold text-[#E8E8E8] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#76A98C]" />
              <span>موتور محاسباتی قطعی تئا</span>
            </h3>
            <p className="text-[11px] text-[#9A9DA5] leading-relaxed">
              این پیش‌بینی بر اساس استهلاک ماهانه وام‌ها، نرخ بهره رسمی، پس‌انداز منظم و فرض بازدهی سالانه {growthOverride !== null ? `${growthOverride}٪` : `${baselineRate}٪`} محاسبه شده و با اسنپ‌شات‌های واقعی کالیبره می‌شود.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] space-y-1">
              <span className="text-[10px] text-[#9A9DA5]">بدهی کل در افق</span>
              <div className="text-sm font-semibold text-[#C77A82] font-mono tabular-nums">
                {formatMoney(parseFloat(String(trajectory?.projected_liabilities_end || "0")))}
              </div>
            </div>
            <div className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] space-y-1">
              <span className="text-[10px] text-[#9A9DA5]">زمان تسویه بدهی‌ها</span>
              <div className="text-sm font-semibold text-[#76A98C]">
                {trajectory?.debt_free_date ? formatDate(trajectory.debt_free_date) : "بدون بدهی جاری"}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "loans" && (
        <div className="space-y-2.5">
          {(!trajectory?.loans || trajectory.loans.length === 0) ? (
            <div className="p-8 text-center text-xs text-[#9A9DA5] bg-[#141518] border border-[#282A2F] rounded-[20px]">
              هیچ وام یا بدهی فعالی در مسیر استهلاک یافت نشد.
            </div>
          ) : (
            trajectory.loans.map((loan, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#E8E8E8]">{loan.name}</span>
                  <span className="text-[11px] text-[#C77A82] font-mono tabular-nums">
                    مانده: {formatMoney(parseFloat(String(loan.current_balance)))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#9A9DA5]">
                  <span>قسط ماهانه: {formatMoney(parseFloat(String(loan.monthly_payment)))}</span>
                  <span>پایان: {loan.estimated_payoff_date ? formatDate(loan.estimated_payoff_date) : "-"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "assets" && (
        <div className="space-y-2.5">
          {(!trajectory?.investments || trajectory.investments.length === 0) ? (
            <div className="p-8 text-center text-xs text-[#9A9DA5] bg-[#141518] border border-[#282A2F] rounded-[20px]">
              هیچ دارایی سرمایه‌گذاری برای پیش‌بینی ثبت نشده است.
            </div>
          ) : (
            trajectory.investments.map((asset, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#E8E8E8]">{asset.name}</span>
                  <span className="text-[11px] text-[#76A98C] font-mono tabular-nums">
                    آینده: {formatMoney(parseFloat(String(asset.projected_value_1y)))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#9A9DA5]">
                  <span>فعلی: {formatMoney(parseFloat(String(asset.current_value)))}</span>
                  <span className="text-[#F0AE55]">رشد مفروض: {asset.projected_annual_growth_rate}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "milestones" && (
        <div className="space-y-2.5">
          {(!trajectory?.timeline || trajectory.timeline.filter((p) => p.is_forecast).length === 0) ? (
            <div className="p-8 text-center text-xs text-[#9A9DA5] bg-[#141518] border border-[#282A2F] rounded-[20px]">
              نقطه عطفی در افق پیش‌بینی ثبت نشده است.
            </div>
          ) : (
            trajectory.timeline
              .filter((p) => p.is_forecast)
              .slice(0, 10)
              .map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[10px] bg-[#F0AE55]/10 border border-[#F0AE55]/30 text-[#F0AE55] flex items-center justify-center text-xs font-bold font-mono">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#E8E8E8]">
                        {formatDate(m.date)}
                      </div>
                      <div className="text-[11px] text-[#9A9DA5]">
                        بدهی: {formatMoney(parseFloat(String(m.total_liabilities)))}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-[#76A98C] font-mono tabular-nums" dir="ltr">
                    {formatMoney(parseFloat(String(m.net_worth)))}
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
