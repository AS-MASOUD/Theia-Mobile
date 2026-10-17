"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  Coins,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Flame,
  Lock,
  Plus,
  RefreshCw,
  Bell,
  SlidersHorizontal,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";
import { MobileCard } from "@/components/mobile/mobile-card";
import { Transaction } from "@/types/financial";

export default function MobileDashboard() {
  const { user } = useAuth();
  const { formatMoney, toggleCurrency, currency } = useCurrency();
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>("all");

  const { data: overview, isLoading, refetch } = useQuery({
    queryKey: ["mobile-overview"],
    queryFn: () => api.getOverview(),
  });

  const { data: snapshots } = useQuery({
    queryKey: ["mobile-snapshots"],
    queryFn: () => api.getSnapshots(30),
  });

  // Calculate dynamic metrics or fallback to rich sample values
  const netWorth = overview?.net_worth ? parseFloat(overview.net_worth) : 845000000;
  const liquidCash = overview?.liquid_cash ? parseFloat(overview.liquid_cash) : 310000000;
  const totalLiabilities = overview?.total_liabilities ? parseFloat(overview.total_liabilities) : 95000000;
  const monthlyCashflow = overview?.monthly_debt_service ? parseFloat(overview.monthly_debt_service) : 18500000;

  const userName = user?.full_name || "تئو رضایی";

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["mobile-recent-txs"],
    queryFn: () => api.getTransactions(5, 0),
  });
  const txList: Transaction[] = transactions || [];

  return (
    <div className="space-y-5">
      {/* Top Bar: Profile Greeting & Currency Toggle (Screen 1 Inspiration) */}
      <div className="flex items-center justify-between pt-1">
        <Link href="/profile" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-11 h-11 rounded-[16px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#F0AE55] font-medium text-base">
              {userName.slice(0, 1)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#76A98C] border-2 border-[#0D0E10] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#9A9DA5]">
              <span>عصر بخیر</span>
              <span>•</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleCurrency();
                }}
                className="text-[#F0AE55] font-medium hover:underline"
              >
                {currency === "TOMAN" ? "تومان" : "USD"}
              </button>
            </div>
            <h1 className="text-base font-semibold text-[#E8E8E8] tracking-tight transition-colors">
              {userName}
            </h1>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors"
            title="بروزرسانی"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#F0AE55]" : ""}`} />
          </button>
          <div className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] relative">
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#F0AE55] rounded-full" />
          </div>
        </div>
      </div>

      {/* Financial Status Chips Bar */}
      <div className="flex items-center gap-2 text-xs font-normal text-[#9A9DA5] overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141518] border border-[#282A2F] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F0AE55] shadow-[0_0_6px_rgba(240,174,85,0.8)]" />
          <span>ارزش خالص:</span>
          <span className="text-[#E8E8E8] font-medium font-number">{formatMoney(netWorth)}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141518] border border-[#282A2F] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#76A98C] shadow-[0_0_6px_rgba(118,169,140,0.8)]" />
          <span>۴ تعهد فعال</span>
        </div>
      </div>

      {/* Quick Scene Pills (Inspired by Screen 1) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveQuickFilter("all")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[14px] text-xs font-medium transition-all shrink-0 active:scale-95 ${
            activeQuickFilter === "all"
              ? "bg-[rgba(240,174,85,0.09)] text-[#F0AE55] border border-[rgba(240,174,85,0.25)] shadow-[0_0_12px_rgba(240,174,85,0.15)]"
              : "bg-[#141518] text-[#9A9DA5] border border-[#282A2F] hover:text-[#E8E8E8]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>نمای کلی</span>
        </button>

        <Link
          href="/portfolio"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[14px] text-xs font-medium bg-[#141518] text-[#9A9DA5] border border-[#282A2F] hover:text-[#E8E8E8] hover:border-[#32343A] transition-colors shrink-0 active:scale-95"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#696D77]" />
          <span>تخصیص سبد</span>
        </Link>

        <Link
          href="/health"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[14px] text-xs font-medium bg-[#141518] text-[#9A9DA5] border border-[#282A2F] hover:text-[#E8E8E8] hover:border-[#32343A] transition-colors shrink-0 active:scale-95"
        >
          <Flame className="w-3.5 h-3.5 text-[#696D77]" />
          <span>اقلیم مالی</span>
        </Link>
      </div>

      {/* 2x3 Tactile Grid Cards (Direct Translation of Screen 1) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Net Worth */}
        <MobileCard
          title="ارزش خالص"
          value={formatMoney(netWorth)}
          subtitle="+۸.۴٪ رشد سالانه"
          badge="فعال"
          badgeVariant="amber"
          icon={Wallet}
          iconColor="amber"
          href="/cashflow"
        />

        {/* Card 2: Financial Climate */}
        <MobileCard
          title="اقلیم سلامت"
          value="۸۲ / ۱۰۰"
          subtitle="هدف: ۸۵ (مطلوب)"
          badge="مطلوب"
          badgeVariant="amber"
          icon={Flame}
          iconColor="amber"
          href="/health"
        />

        {/* Card 3: Free Liquidity */}
        <MobileCard
          title="نقدینگی آزاد"
          value={formatMoney(liquidCash)}
          subtitle="نسبت نقدینگی: عالی"
          badge="سالم"
          badgeVariant="emerald"
          icon={Coins}
          iconColor="emerald"
          href="/assets"
        />

        {/* Card 4: Liabilities */}
        <MobileCard
          title="بدهی و اقساط"
          value={formatMoney(totalLiabilities)}
          subtitle={`قسط ماهانه: ${formatMoney(monthlyCashflow)}`}
          badge="جاری"
          badgeVariant="coral"
          icon={ShieldAlert}
          iconColor="coral"
          href="/health"
        />

        {/* Card 5: Emergency Lock */}
        <MobileCard
          title="سپرده اضطراری"
          value="۶ ماه پوشش"
          subtitle="پوشش هزینه‌های غیرمنتظره"
          badge="امن"
          badgeVariant="neutral"
          icon={Lock}
          iconColor="neutral"
          href="/portfolio"
        />

        {/* Card 6: AI Assistant */}
        <MobileCard
          title="مشاور تئا"
          value="فرصت خرید طلا"
          subtitle="توصیه استراتژیک امروز"
          badge="پیشنهاد"
          badgeVariant="neutral"
          icon={Sparkles}
          iconColor="neutral"
          href="/portfolio"
        />
      </div>

      {/* Quick Action Banner (Reference Screen 6: Soft Illuminated ACTIVATE Pill) */}
      <div className="obsidian-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[14px] bg-[rgba(240,174,85,0.08)] border border-[rgba(240,174,85,0.25)] flex items-center justify-center text-[#F0AE55] shadow-[0_0_12px_rgba(240,174,85,0.18)]">
            <Plus className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-[#E8E8E8]">ثبت تراکنش سریع</h4>
            <p className="text-[11px] text-[#696D77]">افزودن درآمد، هزینه یا خرید دارایی</p>
          </div>
        </div>
        <Link
          href="/cashflow"
          className="px-3.5 py-1.5 rounded-[12px] btn-illuminated-amber text-xs font-medium flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>شروع</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Recent Cash Activity */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-medium text-[#9A9DA5]">آخرین رویدادهای مالی</h2>
          <Link href="/cashflow" className="text-[11px] text-[#F0AE55] font-medium hover:underline">
            مشاهده دفتر کل
          </Link>
        </div>

        <div className="space-y-2">
          {txList.length > 0 ? (
            txList.slice(0, 4).map((tx) => {
              const isIncome =
                tx.transaction_type === "INCOME" ||
                parseFloat(String(tx.total_amount || 0)) > 0;
              const amountVal = parseFloat(String(tx.total_amount || 0));

              return (
                <div
                  key={tx.id}
                  className="obsidian-card p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-[12px] border flex items-center justify-center ${
                        isIncome
                          ? "bg-[#141518] border-[#282A2F] text-[#76A98C]"
                          : "bg-[#141518] border-[#282A2F] text-[#C77A82]"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#E8E8E8]">
                        {tx.notes || (isIncome ? "دریافت و درآمد" : "هزینه / انتقال")}
                      </p>
                      <p className="text-[10px] text-[#696D77] font-number">
                        {new Date(tx.transaction_date).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium font-number ${
                      isIncome ? "text-[#76A98C]" : "text-[#E8E8E8]"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatMoney(Math.abs(amountVal))}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="obsidian-card p-4 text-center text-xs text-[#696D77]">
              تراکنشی یافت نشد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
