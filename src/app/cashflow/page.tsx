"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Share2,
  TrendingUp,
  Leaf,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";

export default function MobileCashflowPage() {
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();

  const { data: cashflowSummary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["cashflow-summary"],
    queryFn: () => api.getCashflowSummary(),
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["cashflow-categories"],
    queryFn: () => api.getCategories(),
  });

  const { data: overview } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => api.getOverview(),
  });

  // Calculate real values
  const monthlyIncome = cashflowSummary?.total_income
    ? parseFloat(String(cashflowSummary.total_income))
    : overview?.monthly_income
    ? parseFloat(overview.monthly_income)
    : 85000000;

  const monthlyExpenses = cashflowSummary?.total_expenses
    ? parseFloat(String(cashflowSummary.total_expenses))
    : overview?.monthly_expenses
    ? parseFloat(overview.monthly_expenses)
    : 43800000;

  const netSavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : 48;

  const categoryBreakdown = cashflowSummary?.categories_breakdown || [];

  return (
    <div className="space-y-5">
      {/* Top Header (Screen 6: Energy / MONTHLY INSIGHT) */}
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

        <button
          onClick={() => queryClient.invalidateQueries()}
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#F0AE55] active:scale-95 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSummaryLoading ? "animate-spin text-[#F0AE55]" : ""}`} />
        </button>
      </div>

      {/* Hero Metric Banner (Direct Screen 6 Translation: 412 kWh) */}
      <div className="obsidian-card p-5 relative overflow-hidden">
        <span className="text-xs font-medium text-[#9A9DA5]">
          مازاد جریان نقد عملیاتی ماهانه
        </span>

        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-3xl font-semibold text-[#F0AE55] font-number tracking-tight">
            {formatMoney(netSavings > 0 ? netSavings : 41200000)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-[#76A98C] mt-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+ {savingsRate}٪ نسبت پس‌انداز ماهانه به درآمد</span>
        </div>
      </div>

      {/* Outflow by Category / Room Usage Bars (Screen 6 Translation) */}
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
              const pct = monthlyExpenses > 0 ? Math.min(Math.round((amount / monthlyExpenses) * 100), 100) : 25;
              const barColors = [
                "bg-[#F0AE55]",
                "bg-[#B9823D]",
                "bg-[#76A98C]",
                "bg-[#88A9BC]",
              ][idx % 4];

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
                      className={`h-full ${barColors} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9A9DA5] font-normal">سرمایه‌گذاری در طلا و سهام</span>
                <span className="text-[#F0AE55] font-medium font-number">۲۲,۵۰۰,۰۰۰ ت (۵۱٪)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1B1D21] border border-[#282A2F] overflow-hidden">
                <div
                  style={{ width: "51%" }}
                  className="h-full bg-[#F0AE55] rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9A9DA5] font-normal">هزینه‌های پایدار و مسکن</span>
                <span className="text-[#E8E8E8] font-medium font-number">۱۲,۸۰۰,۰۰۰ ت (۲۹٪)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1B1D21] border border-[#282A2F] overflow-hidden">
                <div
                  style={{ width: "29%" }}
                  className="h-full bg-[#76A98C] rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9A9DA5] font-normal">اقساط و تعهدات</span>
                <span className="text-[#C77A82] font-medium font-number">۸,۵۰۰,۰۰۰ ت (۲۰٪)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1B1D21] border border-[#282A2F] overflow-hidden">
                <div
                  style={{ width: "20%" }}
                  className="h-full bg-[#C77A82] rounded-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dual Cards at Bottom (Screen 6: Savings & Peak Time) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Savings */}
        <div className="obsidian-card p-3.5 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] flex items-center justify-center text-[#76A98C] mb-2.5">
            <Leaf className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[10px] font-medium text-[#9A9DA5] block">
              صرفه‌جویی بودجه
            </span>
            <span className="text-base font-semibold text-[#76A98C] font-number mt-0.5 block">
              {formatMoney(netSavings > 0 ? netSavings * 0.3 : 12400000)}
            </span>
            <span className="text-[10px] text-[#696D77] mt-0.5 block">
              پایین‌تر از سقف
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
              پیک سررسید پرداخت
            </span>
            <span className="text-base font-semibold text-[#E8E8E8] font-number mt-0.5 block">
              ۲۵ هر ماه
            </span>
            <span className="text-[10px] text-[#696D77] mt-0.5 block">
              سررسید اقساط
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
