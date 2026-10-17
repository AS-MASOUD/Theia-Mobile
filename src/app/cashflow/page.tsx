"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Leaf,
  Clock,
  RefreshCw,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";
import { AddCashflowModal } from "@/components/mobile/add-cashflow-modal";
import { CashflowEntry } from "@/types/financial";

export default function MobileCashflowPage() {
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: cashflowSummary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["cashflow-summary"],
    queryFn: () => api.getCashflowSummary(),
  });

  const { data: entries, isLoading: isEntriesLoading } = useQuery<CashflowEntry[]>({
    queryKey: ["cashflow-entries"],
    queryFn: () => api.getEntries(20),
  });

  const { data: overview } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => api.getOverview(),
  });

  // Calculate authoritative values from real backend
  const monthlyIncome = cashflowSummary?.total_income
    ? parseFloat(String(cashflowSummary.total_income))
    : overview?.monthly_income
    ? parseFloat(overview.monthly_income)
    : 0;

  const monthlyExpenses = cashflowSummary?.total_expenses
    ? parseFloat(String(cashflowSummary.total_expenses))
    : overview?.monthly_expenses
    ? parseFloat(overview.monthly_expenses)
    : 0;

  const netSavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : 0;

  const categoryBreakdown = cashflowSummary?.categories_breakdown || [];

  // Determine peak due day from real obligations
  const peakDueDay = overview?.upcoming_obligations?.[0]?.due_day || 25;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href="/"
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>

        <div className="text-center">
          <h1 className="text-sm font-semibold text-[#E8E8E8]">انرژی و جریان مالی</h1>
          <p className="text-[10px] text-[#F0AE55] font-medium uppercase tracking-wider">
            Monthly Insight
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["cashflow-summary"] });
              queryClient.invalidateQueries({ queryKey: ["cashflow-entries"] });
            }}
            className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#F0AE55] active:scale-95 transition-colors cursor-pointer"
            title="بروزرسانی جریان نقد"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSummaryLoading ? "animate-spin text-[#F0AE55]" : ""}`} />
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="w-9 h-9 rounded-[14px] bg-[rgba(240,174,85,0.08)] border border-[rgba(240,174,85,0.25)] flex items-center justify-center text-[#F0AE55] active:scale-95 transition-colors cursor-pointer"
            title="ثبت ورودی/خروجی جدید"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Hero Metric Banner */}
      <div className="obsidian-card p-5 relative overflow-hidden">
        <span className="text-xs font-medium text-[#9A9DA5]">
          مازاد جریان نقد عملیاتی ماهانه
        </span>

        <div className="flex items-baseline gap-2 mt-1.5">
          <span
            className={`text-3xl font-semibold font-number tracking-tight ${
              netSavings >= 0 ? "text-[#F0AE55]" : "text-[#C77A82]"
            }`}
          >
            {formatMoney(netSavings)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium mt-2">
          {netSavings >= 0 ? (
            <span className="text-[#76A98C] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{savingsRate}٪ نسبت پس‌انداز ماهانه به کل درآمد</span>
            </span>
          ) : (
            <span className="text-[#C77A82] flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>کسری جریان نقدینگی ماهانه</span>
            </span>
          )}
        </div>
      </div>

      {/* Outflow by Category / Room Usage Bars */}
      <div className="obsidian-card p-4 space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#9A9DA5]">
            توزیع مصارف و هزینه‌ها از سرور
          </span>
          <span className="font-medium text-[#E8E8E8] font-number">
            {formatMoney(monthlyExpenses)} کل مصارف
          </span>
        </div>

        {categoryBreakdown.length > 0 ? (
          <div className="space-y-3">
            {categoryBreakdown.map((cat: { category: string; amount: number; color?: string; flow_type?: string }, idx: number) => {
              const amount = parseFloat(String(cat.amount || 0));
              const pct = monthlyExpenses > 0 ? Math.min(Math.round((amount / monthlyExpenses) * 100), 100) : 0;
              const barColors = [
                "bg-[#F0AE55]",
                "bg-[#B9823D]",
                "bg-[#76A98C]",
                "bg-[#88A9BC]",
                "bg-[#C77A82]",
              ][idx % 5];

              return (
                <div key={cat.category || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9A9DA5] font-normal">{cat.category}</span>
                    <span className="text-[#E8E8E8] font-medium font-number">
                      {formatMoney(amount)} ({pct}٪)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1B1D21] border border-[#282A2F] overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${barColors} rounded-full transition-all`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-[16px] bg-[#1B1D21] border border-[#282A2F] text-center text-xs text-[#696D77] space-y-2">
            <p>سرفصل هزینه‌ای برای دوره جاری ثبت نشده است.</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-3 py-1.5 rounded-[10px] bg-[#141518] border border-[rgba(240,174,85,0.25)] text-[#F0AE55] text-xs font-medium inline-flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ثبت اولین هزینه</span>
            </button>
          </div>
        )}
      </div>

      {/* Real Cashflow Entries List */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-medium text-[#9A9DA5]">
            ردیف‌های دفتر کل جریان نقد
          </h2>
          <span className="text-[11px] text-[#F0AE55] font-medium font-number">
            {entries?.length || 0} ردیف
          </span>
        </div>

        <div className="space-y-2">
          {isEntriesLoading ? (
            <div className="obsidian-card p-6 text-center text-xs text-[#696D77]">
              در حال بارگذاری دفتر کل...
            </div>
          ) : entries && entries.length > 0 ? (
            entries.slice(0, 10).map((entry) => {
              const isIncome = entry.flow_type === "income";
              const amountVal = parseFloat(String(entry.amount || 0));

              return (
                <div
                  key={entry.id}
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
                        {entry.description}
                      </p>
                      <p className="text-[10px] text-[#696D77] font-number">
                        {entry.category_name || (isIncome ? "درآمد" : "هزینه")} •{" "}
                        {entry.entry_date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium font-number ${
                      isIncome ? "text-[#76A98C]" : "text-[#E8E8E8]"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatMoney(amountVal)}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="obsidian-card p-4 text-center text-xs text-[#696D77]">
              ردیفی در دفتر کل ثبت نشده است.
            </div>
          )}
        </div>
      </div>

      {/* Dual Cards at Bottom */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Savings */}
        <div className="obsidian-card p-3.5 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] flex items-center justify-center text-[#76A98C] mb-2.5">
            <Leaf className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[10px] font-medium text-[#9A9DA5] block">
              پس‌انداز مازاد ماهانه
            </span>
            <span
              className={`text-base font-semibold font-number mt-0.5 block ${
                netSavings >= 0 ? "text-[#76A98C]" : "text-[#C77A82]"
              }`}
            >
              {formatMoney(Math.max(netSavings, 0))}
            </span>
            <span className="text-[10px] text-[#696D77] mt-0.5 block">
              {netSavings > 0 ? "مازاد قابل سرمایه‌گذاری" : "تراز صفر یا منفی"}
            </span>
          </div>
        </div>

        {/* Card 2: Peak Due Time */}
        <div className="obsidian-card p-3.5 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] flex items-center justify-center text-[#F0AE55] mb-2.5">
            <Clock className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[10px] font-medium text-[#9A9DA5] block">
              سررسید اقساط و تعهدات
            </span>
            <span className="text-base font-semibold text-[#E8E8E8] font-number mt-0.5 block">
              {peakDueDay} هر ماه
            </span>
            <span className="text-[10px] text-[#696D77] mt-0.5 block">
              {overview?.upcoming_obligations?.length || 0} تعهد فعال
            </span>
          </div>
        </div>
      </div>

      {/* Add Cashflow Modal */}
      <AddCashflowModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
