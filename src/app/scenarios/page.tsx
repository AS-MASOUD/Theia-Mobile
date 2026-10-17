"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Plus,
  Play,
  RotateCcw,
  Target,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Trash2,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";
import { AddGoalModal } from "@/components/mobile/add-goal-modal";
import { FinancialGoal, ScenarioSimulationResponse } from "@/types/financial";

export default function MobileScenariosPage() {
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);

  // Simulation Parameters State
  const [horizonMonths, setHorizonMonths] = useState(36);
  const [incomeDelta, setIncomeDelta] = useState("5000000");
  const [expenseDelta, setExpenseDelta] = useState("-2000000");
  const [growthRate, setGrowthRate] = useState("25.0");
  const [newLoanAmount, setNewLoanAmount] = useState("0");
  const [newLoanRate, setNewLoanRate] = useState("18.0");
  const [newLoanTerm, setNewLoanTerm] = useState(24);
  const [windfall, setWindfall] = useState("0");

  const [simResult, setSimResult] = useState<ScenarioSimulationResponse | null>(null);

  // Real backend goals
  const { data: goals, isLoading: isGoalsLoading } = useQuery<FinancialGoal[]>({
    queryKey: ["mobile-goals"],
    queryFn: () => api.getGoals(),
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => api.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  // Simulate What-If Scenario mutation
  const simulateMutation = useMutation({
    mutationFn: () =>
      api.simulateScenario({
        name: "Interactive Mobile Simulation",
        horizon_months: horizonMonths,
        monthly_income_delta: incomeDelta || "0",
        monthly_expense_delta: expenseDelta || "0",
        asset_growth_rate_annual: growthRate || "7",
        new_loan_amount: newLoanAmount || "0",
        new_loan_rate_annual: newLoanRate || "6.5",
        new_loan_term_months: newLoanTerm,
        one_time_windfall: windfall || "0",
      }),
    onSuccess: (data) => {
      setSimResult(data);
    },
  });

  // Execute baseline simulation on initial mount
  useEffect(() => {
    simulateMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <h1 className="text-sm font-semibold text-[#E8E8E8]">سناریوهای هوشمند تئا</h1>
          <p className="text-[10px] text-[#F0AE55] font-medium uppercase tracking-wider">
            What-If Engine & Goals
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["mobile-goals"] });
              simulateMutation.mutate();
            }}
            className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#F0AE55] active:scale-95 transition-colors cursor-pointer"
            title="بروزرسانی داده‌ها"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isGoalsLoading || simulateMutation.isPending ? "animate-spin text-[#F0AE55]" : ""
              }`}
            />
          </button>
          <button
            onClick={() => setIsAddGoalOpen(true)}
            className="w-9 h-9 rounded-[14px] bg-[rgba(240,174,85,0.08)] border border-[rgba(240,174,85,0.25)] flex items-center justify-center text-[#F0AE55] active:scale-95 transition-colors cursor-pointer"
            title="تعریف هدف مالی جدید"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* What-If Interactive Engine Card */}
      <div className="obsidian-card p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#282A2F]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[10px] bg-[rgba(240,174,85,0.09)] border border-[rgba(240,174,85,0.22)] text-[#F0AE55] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#E8E8E8]">
                موتور شبیه‌سازی مالی برخط
              </h2>
              <p className="text-[10px] text-[#9A9DA5]">
                محاسبه اثر تغییر درآمد، تورم دارایی‌ها و تسهیلات
              </p>
            </div>
          </div>
          <button
            onClick={() => simulateMutation.mutate()}
            disabled={simulateMutation.isPending}
            className="px-3 py-1.5 rounded-[10px] btn-illuminated-amber text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            {simulateMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            <span>محاسبه</span>
          </button>
        </div>

        {/* Sliders and Inputs */}
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between text-[#9A9DA5] font-medium mb-1">
              <span>افق زمانی شبیه‌سازی</span>
              <span className="text-[#F0AE55] font-number font-semibold">
                {horizonMonths} ماه ({Math.round(horizonMonths / 12)} سال)
              </span>
            </div>
            <input
              type="range"
              min="12"
              max="120"
              step="6"
              value={horizonMonths}
              onChange={(e) => setHorizonMonths(parseInt(e.target.value, 10))}
              className="w-full accent-[#F0AE55] h-1.5 bg-[#1B1D21] rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">تغییر درآمد ماهانه (تومان)</label>
              <input
                type="text"
                value={incomeDelta}
                onChange={(e) => setIncomeDelta(e.target.value)}
                placeholder="+5000000"
                className="w-full px-2.5 py-1.5 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:outline-none focus:border-[#F0AE55]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">تغییر مخارج ماهانه (تومان)</label>
              <input
                type="text"
                value={expenseDelta}
                onChange={(e) => setExpenseDelta(e.target.value)}
                placeholder="-2000000"
                className="w-full px-2.5 py-1.5 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:outline-none focus:border-[#F0AE55]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">رشد سالانه دارایی‌ها (٪)</label>
              <input
                type="text"
                value={growthRate}
                onChange={(e) => setGrowthRate(e.target.value)}
                placeholder="25.0"
                className="w-full px-2.5 py-1.5 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:outline-none focus:border-[#F0AE55]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">مبلغ تسهیلات جدید (تومان)</label>
              <input
                type="text"
                value={newLoanAmount}
                onChange={(e) => setNewLoanAmount(e.target.value)}
                placeholder="0"
                className="w-full px-2.5 py-1.5 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:outline-none focus:border-[#F0AE55]"
              />
            </div>
          </div>
        </div>

        {/* Live Simulation Results */}
        {simResult && (
          <div className="p-3.5 rounded-[16px] bg-[#1B1D21] border border-[rgba(240,174,85,0.22)] space-y-2.5 animate-in fade-in">
            <span className="text-[10px] font-semibold text-[#F0AE55] uppercase tracking-wider block">
              خروجی قطعی محاسبات بک‌اند
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-[#9A9DA5] block">ارزش خالص پیش‌بینی‌شده</span>
                <span className="text-sm font-semibold text-[#E8E8E8] font-number mt-0.5 block">
                  {formatMoney(simResult.final_projected_net_worth)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#9A9DA5] block">رشد پیش‌بینی‌شده خالص</span>
                <span className="text-sm font-semibold text-[#76A98C] font-number mt-0.5 block">
                  +{formatMoney(simResult.net_worth_delta)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#282A2F] flex items-center justify-between text-[11px]">
              <span className="text-[#9A9DA5]">جریان نقد ماهانه جدید:</span>
              <span className="text-[#E8E8E8] font-semibold font-number">
                {formatMoney(simResult.new_monthly_cashflow)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Real Goals from Backend */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-medium text-[#9A9DA5]">
            اهداف مالی تعریف‌شده در سرور
          </h2>
          <span className="text-[11px] text-[#F0AE55] font-medium font-number">
            {goals?.length || 0} هدف
          </span>
        </div>

        {isGoalsLoading ? (
          <div className="obsidian-card p-6 text-center text-xs text-[#696D77]">
            در حال دریافت اهداف مالی...
          </div>
        ) : goals && goals.length > 0 ? (
          <div className="space-y-2">
            {goals.map((goal) => {
              const pct = Math.min(Math.round(parseFloat(goal.progress_percent || "0")), 100);

              return (
                <div key={goal.id} className="obsidian-card p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-[#F0AE55]" />
                      <span className="text-xs font-medium text-[#E8E8E8]">{goal.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#F0AE55] font-number">
                        {pct}٪
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`آیا از حذف هدف مالی «${goal.name}» اطمینان دارید؟`)) {
                            deleteGoalMutation.mutate(goal.id);
                          }
                        }}
                        className="text-[#696D77] hover:text-[#C77A82] transition-colors p-0.5 cursor-pointer"
                        title="حذف هدف"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[#1B1D21] border border-[#282A2F] overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-[#F0AE55] rounded-full transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#9A9DA5]">
                    <span>هدف: {formatMoney(goal.target_amount)}</span>
                    <span>تأمین‌شده: {formatMoney(goal.current_amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="obsidian-card p-5 text-center text-xs text-[#696D77] space-y-2">
            <p>هدف مالی یا سناریوی هدفمندی تعریف نشده است.</p>
            <button
              onClick={() => setIsAddGoalOpen(true)}
              className="px-3.5 py-1.5 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] text-xs font-medium inline-flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تعریف اولین هدف مالی</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal isOpen={isAddGoalOpen} onClose={() => setIsAddGoalOpen(false)} />
    </div>
  );
}
