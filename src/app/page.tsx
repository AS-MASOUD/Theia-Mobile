"use client";

import React, { useState, useMemo } from "react";
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
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";
import { MobileCard } from "@/components/mobile/mobile-card";
import { QuickTransactionModal } from "@/components/mobile/transaction-modal";
import { MobileOnboardingModal } from "@/components/mobile/onboarding-modal";
import { Transaction } from "@/types/financial";

export default function MobileDashboard() {
  const { user } = useAuth();
  const { formatMoney, toggleCurrency, currency } = useCurrency();
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>("all");
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  const {
    data: overview,
    isLoading: isOverviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ["mobile-overview"],
    queryFn: () => api.getOverview(),
  });

  const { data: snapshots } = useQuery({
    queryKey: ["mobile-snapshots"],
    queryFn: () => api.getSnapshots(30),
  });

  const { data: transactions, isLoading: isTxLoading } = useQuery<Transaction[]>({
    queryKey: ["mobile-recent-txs"],
    queryFn: () => api.getTransactions(6, 0),
  });

  // Calculate authoritative values from real backend overview
  const netWorth = overview?.net_worth ? parseFloat(overview.net_worth) : 0;
  const totalAssets = overview?.total_assets ? parseFloat(overview.total_assets) : 0;
  const liquidCash = overview?.liquid_cash ? parseFloat(overview.liquid_cash) : 0;
  const totalLiabilities = overview?.total_liabilities ? parseFloat(overview.total_liabilities) : 0;
  const monthlyDebt = overview?.monthly_debt_service ? parseFloat(overview.monthly_debt_service) : 0;
  const monthlyIncome = overview?.monthly_income ? parseFloat(overview.monthly_income) : 0;
  const monthlyExpenses = overview?.monthly_expenses ? parseFloat(overview.monthly_expenses) : 0;

  // Real Net Worth change computed from historical snapshots (matching desktop formula)
  const netWorthChange = useMemo(() => {
    if (!snapshots || snapshots.length < 2) return 0;
    const sorted = [...snapshots].sort(
      (a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
    );
    const latest = sorted[sorted.length - 1];
    const latestNw = parseFloat(latest.net_worth) || 0;
    const oldest = sorted[0];
    const oldestNw = parseFloat(oldest.net_worth) || 0;
    if (oldestNw === 0) return 0;
    const change = ((latestNw - oldestNw) / Math.abs(oldestNw)) * 100;
    return isFinite(change) ? Number(change.toFixed(1)) : 0;
  }, [snapshots]);

  // Real Health Score based on asset coverage and debt obligations
  const healthScore = useMemo(() => {
    if (totalAssets <= 0) return 0;
    const netAssetsRatio = Math.max(0, (totalAssets - totalLiabilities) / totalAssets);
    const debtRatio = monthlyIncome > 0 ? monthlyDebt / monthlyIncome : 0;
    let score = Math.round(netAssetsRatio * 75 + Math.max(0, 1 - debtRatio) * 25);
    return Math.min(Math.max(score, 5), 100);
  }, [totalAssets, totalLiabilities, monthlyIncome, monthlyDebt]);

  // Dynamic emergency reserve coverage
  const emergencyCoverageLabel = useMemo(() => {
    if (monthlyExpenses > 0) {
      const months = (liquidCash / monthlyExpenses).toFixed(1);
      return `${months} ماه پوشش`;
    }
    if (liquidCash > 0) {
      return "پوشش نقدینگی فعال";
    }
    return "نیاز به ذخیره امن";
  }, [liquidCash, monthlyExpenses]);

  // Authoritative AI / Attention Advice
  const attentionItem = overview?.attention_items && overview.attention_items.length > 0
    ? overview.attention_items[0]
    : null;

  const userName = user?.full_name || "کاربر تئا";
  const txList: Transaction[] = transactions || [];

  return (
    <div className="space-y-5">
      {/* Top Bar: Profile Greeting & Currency Toggle */}
      <div className="flex items-center justify-between pt-1">
        <Link href="/profile" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-11 h-11 rounded-[16px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#F0AE55] font-medium text-base">
              {userName.slice(0, 1)}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[#0D0E10] rounded-full ${
                user?.has_completed_financial_onboarding ? "bg-[#76A98C]" : "bg-[#F0AE55]"
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#9A9DA5]">
              <span>عصر بخیر</span>
              <span>•</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toggleCurrency();
                }}
                className="text-[#F0AE55] font-medium hover:underline cursor-pointer"
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
            onClick={() => refetchOverview()}
            className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors cursor-pointer"
            title="بروزرسانی داده‌ها"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isOverviewLoading ? "animate-spin text-[#F0AE55]" : ""}`}
            />
          </button>
          <div className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] relative">
            <Bell className="w-3.5 h-3.5" />
            {attentionItem && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#F0AE55] rounded-full shadow-[0_0_6px_rgba(240,174,85,0.8)]" />
            )}
          </div>
        </div>
      </div>

      {/* Onboarding Guidance Banner if un-onboarded */}
      {user && !user.has_completed_financial_onboarding && (
        <div className="obsidian-card p-4 border-[rgba(240,174,85,0.25)] flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[rgba(240,174,85,0.08)] border border-[rgba(240,174,85,0.25)] text-[#F0AE55] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#E8E8E8]">
                حساب آماده راه‌اندازی است!
              </h3>
              <p className="text-[11px] text-[#9A9DA5]">
                برای فعال‌سازی نمودارها، مقادیر اولیه دارایی را ثبت کنید.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOnboardingModalOpen(true)}
            className="px-3 py-1.5 rounded-[10px] btn-illuminated-amber text-xs font-semibold shrink-0 active:scale-95 transition-all cursor-pointer"
          >
            تکمیل پرونده
          </button>
        </div>
      )}

      {/* Financial Status Chips Bar */}
      <div className="flex items-center gap-2 text-xs font-normal text-[#9A9DA5] overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141518] border border-[#282A2F] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F0AE55] shadow-[0_0_6px_rgba(240,174,85,0.8)]" />
          <span>ارزش خالص:</span>
          <span className="text-[#E8E8E8] font-medium font-number">
            {formatMoney(netWorth)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141518] border border-[#282A2F] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#76A98C] shadow-[0_0_6px_rgba(118,169,140,0.8)]" />
          <span>
            {overview?.upcoming_obligations?.length || 0} تعهد فعال
          </span>
        </div>
      </div>

      {/* Quick Scene Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => {
            setActiveQuickFilter("all");
            refetchOverview();
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[14px] text-xs font-medium transition-all shrink-0 active:scale-95 cursor-pointer ${
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

      {/* 2x3 Tactile Grid Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Net Worth */}
        <MobileCard
          title="ارزش خالص"
          value={formatMoney(netWorth)}
          subtitle={
            netWorthChange !== 0
              ? `${netWorthChange > 0 ? "+" : ""}${netWorthChange}٪ نسبت به ۳۰ روز قبل`
              : "ارزش مبنای ترازنامه"
          }
          badge={netWorth > 0 ? "فعال" : "صفر"}
          badgeVariant="amber"
          icon={Wallet}
          iconColor="amber"
          href="/cashflow"
        />

        {/* Card 2: Financial Climate */}
        <MobileCard
          title="اقلیم سلامت"
          value={`${healthScore} / ۱۰۰`}
          subtitle={
            healthScore >= 80
              ? "وضعیت بسیار مطلوب"
              : healthScore >= 50
              ? "تعادل قابل‌قبول"
              : "نیاز به تقویت نقدینگی"
          }
          badge={healthScore >= 75 ? "مطلوب" : "پایش"}
          badgeVariant={healthScore >= 75 ? "amber" : "neutral"}
          icon={Flame}
          iconColor="amber"
          href="/health"
        />

        {/* Card 3: Free Liquidity */}
        <MobileCard
          title="نقدینگی آزاد"
          value={formatMoney(liquidCash)}
          subtitle={
            liquidCash > 0
              ? `سهم از دارایی: ${
                  totalAssets > 0 ? Math.round((liquidCash / totalAssets) * 100) : 0
                }٪`
              : "بدون وجه نقد آزاد"
          }
          badge={liquidCash > 0 ? "سالم" : "تهی"}
          badgeVariant="emerald"
          icon={Coins}
          iconColor="emerald"
          href="/assets"
        />

        {/* Card 4: Liabilities */}
        <MobileCard
          title="بدهی و وام‌ها"
          value={formatMoney(totalLiabilities)}
          subtitle={`قسط ماهانه: ${formatMoney(monthlyDebt)}`}
          badge={totalLiabilities > 0 ? "جاری" : "بدون بدهی"}
          badgeVariant={totalLiabilities > 0 ? "coral" : "emerald"}
          icon={ShieldAlert}
          iconColor="coral"
          href="/health"
        />

        {/* Card 5: Emergency Lock */}
        <MobileCard
          title="سپرده اضطراری"
          value={emergencyCoverageLabel}
          subtitle="پوشش هزینه‌های غیرمنتظره"
          badge={liquidCash > 0 ? "امن" : "اقدام"}
          badgeVariant="neutral"
          icon={Lock}
          iconColor="neutral"
          href="/portfolio"
        />

        {/* Card 6: AI Assistant / Attention Insights */}
        <MobileCard
          title="مشاور تئا"
          value={attentionItem ? attentionItem.title : "توازن پایدار سبد"}
          subtitle={
            attentionItem
              ? attentionItem.message.slice(0, 32) + "..."
              : "بر اساس تحلیل ساختار دارایی‌ها"
          }
          badge={attentionItem ? "هشدار" : "پایش"}
          badgeVariant="neutral"
          icon={Sparkles}
          iconColor="neutral"
          href="/health"
        />
      </div>

      {/* Quick Action Banner */}
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
        <button
          onClick={() => setIsTxModalOpen(true)}
          className="px-3.5 py-1.5 rounded-[12px] btn-illuminated-amber text-xs font-medium flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <span>شروع</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recent Cash Activity from real database */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-medium text-[#9A9DA5]">آخرین رویدادهای مالی</h2>
          <Link href="/cashflow" className="text-[11px] text-[#F0AE55] font-medium hover:underline">
            مشاهده دفتر کل
          </Link>
        </div>

        <div className="space-y-2">
          {isTxLoading ? (
            <div className="obsidian-card p-6 text-center text-xs text-[#696D77]">
              در حال بارگذاری تراکنش‌ها...
            </div>
          ) : txList.length > 0 ? (
            txList.slice(0, 5).map((tx) => {
              const isIncome =
                tx.transaction_type === "INCOME" ||
                tx.transaction_type === "DEPOSIT" ||
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
              تراکنشی در سیستم ثبت نشده است. از دکمه ثبت تراکنش سریع شروع کنید.
            </div>
          )}
        </div>
      </div>

      {/* Switch to Desktop View */}
      <div className="pt-3 pb-8 text-center">
        <a
          href="/?view=desktop"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141518] border border-white/[0.08] text-xs text-[#9A9DA5] hover:text-[#F0AE55] transition-colors"
        >
          <span>مشاهده نسخه کامل دسکتاپ</span>
        </a>
      </div>

      {/* Transaction & Onboarding Modals */}
      <QuickTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />

      <MobileOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
      />
    </div>
  );
}
