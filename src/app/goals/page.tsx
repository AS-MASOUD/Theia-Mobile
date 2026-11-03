"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  Target,
  Clock,
  Calendar,
  Sparkles,
  Trash2,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Coins,
  ShieldCheck,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { FinancialGoal, GoalCategory } from "@/types/financial";

export default function MobileGoalsPage() {
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<FinancialGoal | null>(null);
  const [contribAmount, setContribAmount] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("emergency_fund");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: goals, isLoading, refetch, isRefetching } = useQuery<FinancialGoal[]>({
    queryKey: ["mobile-goals-list"],
    queryFn: () => api.getGoals(),
  });

  const { data: categories } = useQuery<GoalCategory[]>({
    queryKey: ["mobile-goal-categories"],
    queryFn: () => api.getGoalCategories(),
  });

  const catLabels = useMemo(() => {
    if (!categories) return {};
    return Object.fromEntries(categories.map((c) => [c.code, c.label]));
  }, [categories]);

  // Aggregate KPI Stats
  const stats = useMemo(() => {
    if (!goals || goals.length === 0) return { totalTarget: 0, totalCurrent: 0, completionRate: 0 };
    let target = 0;
    let current = 0;
    for (const g of goals) {
      target += parseFloat(g.target_amount) || 0;
      current += parseFloat(g.current_amount) || 0;
    }
    const rate = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    return { totalTarget: target, totalCurrent: current, completionRate: rate };
  }, [goals]);

  // Create Goal Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      setFormError(null);
      if (!name.trim()) throw new Error("عنوان هدف مالی الزامی است.");
      const t = parseFloat(targetAmount);
      if (isNaN(t) || t <= 0) throw new Error("مبلغ هدف باید بیشتر از صفر باشد.");

      const payload = {
        name: name.trim(),
        category,
        target_amount: t,
        current_amount: parseFloat(currentAmount) || 0,
        monthly_contribution: parseFloat(monthlyContribution) || 0,
        target_date: targetDate,
        currency: "TOMAN",
        status: "in_progress",
        notes: notes.trim() || undefined,
      };

      return api.createGoal(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-goals-list"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      setIsAddOpen(false);
      setName("");
      setTargetAmount("");
      setCurrentAmount("");
      setMonthlyContribution("");
      setNotes("");
      setFormError(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در ثبت هدف";
      setFormError(msg);
    },
  });

  // Contribute/Deposit Mutation
  const contributeMutation = useMutation({
    mutationFn: async () => {
      if (!contributingGoal) return;
      const addVal = parseFloat(contribAmount);
      if (isNaN(addVal) || addVal <= 0) throw new Error("مبلغ نامعتبر است.");
      const newTotal = (parseFloat(contributingGoal.current_amount) || 0) + addVal;
      const targetVal = parseFloat(contributingGoal.target_amount) || 1;
      const status = newTotal >= targetVal ? "achieved" : "in_progress";

      return api.updateGoal(contributingGoal.id, {
        current_amount: newTotal,
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-goals-list"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      setContributingGoal(null);
      setContribAmount("");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-goals-list"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
    },
  });

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
          <h1 className="text-sm font-semibold text-[#E8E8E8]">اهداف مالی تئا</h1>
          <p className="text-[10px] text-[#F0AE55] font-medium uppercase tracking-wider">
            Milestones & Savings Goals
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="w-9 h-9 rounded-[14px] btn-illuminated-amber flex items-center justify-center text-xs font-semibold active:scale-95 transition-all shadow-[0_0_12px_rgba(240,174,85,0.2)] cursor-pointer"
          title="افزودن هدف مالی جدید"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] space-y-1">
          <span className="text-[11px] text-[#9A9DA5] block">مجموع پس‌انداز شده</span>
          <div className="text-sm font-bold text-[#76A98C] font-mono tabular-nums">
            {formatMoney(stats.totalCurrent)}
          </div>
          <span className="text-[10px] text-[#696D77] block">
            از هدف کل {formatMoney(stats.totalTarget)}
          </span>
        </div>

        <div className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] space-y-1">
          <span className="text-[11px] text-[#9A9DA5] block">نرخ تحقق کلی</span>
          <div className="text-sm font-bold text-[#F0AE55] font-mono tabular-nums">
            {stats.completionRate}%
          </div>
          <span className="text-[10px] text-[#9A9DA5] block">
            {goals?.length || 0} هدف در حال پیگیری
          </span>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#9A9DA5] px-1">
          <span>اهداف فعال</span>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 hover:text-[#F0AE55] transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isRefetching ? "animate-spin text-[#F0AE55]" : ""}`} />
            <span>بروزرسانی</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#9A9DA5] bg-[#141518] border border-[#282A2F] rounded-[20px]">
            در حال بارگذاری اهداف مالی...
          </div>
        ) : !goals || goals.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9A9DA5] bg-[#141518] border border-[#282A2F] rounded-[20px] space-y-2">
            <Target className="w-8 h-8 mx-auto text-[#696D77] stroke-[1.5]" />
            <p>هنوز هدفی ثبت نکرده‌اید. با ثبت اولین هدف مسیر پس‌انداز را آغاز کنید.</p>
          </div>
        ) : (
          goals.map((g) => {
            const cur = parseFloat(g.current_amount) || 0;
            const tgt = parseFloat(g.target_amount) || 1;
            const pct = Math.min(100, Math.round((cur / tgt) * 100));
            const isDone = g.status === "achieved" || pct >= 100;

            return (
              <div
                key={g.id}
                className="p-4 rounded-[20px] bg-[#141518] border border-[#282A2F] space-y-3 hover:border-[#32343A] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[12px] bg-[rgba(240,174,85,0.08)] border border-[rgba(240,174,85,0.2)] text-[#F0AE55] flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-[#E8E8E8]">{g.name}</h3>
                      <div className="text-[11px] text-[#9A9DA5]">
                        {catLabels[g.category] || g.category} • سررسید: {formatDate(g.target_date)}
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="text-xs font-bold text-[#E8E8E8] font-mono tabular-nums">
                      {formatMoney(cur)}
                    </div>
                    <div className="text-[10px] text-[#9A9DA5]">از {formatMoney(tgt)}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#9A9DA5] font-mono">
                    <span>{pct}% محقق شده</span>
                    <span>{isDone ? "تکمیل شد!" : `مانده: ${formatMoney(Math.max(0, tgt - cur))}`}</span>
                  </div>
                  <div className="h-2 w-full bg-[#1B1D21] rounded-full overflow-hidden border border-[#282A2F]/60">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isDone
                          ? "bg-[#76A98C]"
                          : "bg-gradient-to-l from-[#F0AE55] to-[#76A98C]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Actions & Monthly Target */}
                <div className="pt-2 border-t border-[#282A2F]/70 flex items-center justify-between">
                  <div className="text-[11px] text-[#9A9DA5]">
                    <span>تعهد ماهانه: </span>
                    <span className="font-semibold text-[#E8E8E8] font-mono">
                      {formatMoney(parseFloat(g.monthly_contribution) || 0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setContributingGoal(g)}
                      className="px-2.5 py-1 rounded-[10px] bg-[#F0AE55]/15 text-[#F0AE55] border border-[#F0AE55]/30 text-[11px] font-medium active:scale-95 transition-all cursor-pointer"
                    >
                      افزودن واریزی
                    </button>

                    <button
                      onClick={() => {
                        if (confirm("آیا از حذف این هدف مالی مطمئن هستید؟")) {
                          deleteMutation.mutate(g.id);
                        }
                      }}
                      className="w-7 h-7 rounded-[8px] bg-white/[0.03] text-[#696D77] hover:text-[#C77A82] flex items-center justify-center transition-colors cursor-pointer"
                      title="حذف هدف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Goal Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end justify-center p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="w-full max-w-sm rounded-[24px] bg-[#141518] border border-[#282A2F] p-5 space-y-3.5 animate-in slide-in-from-bottom"
          >
            <div className="flex items-center justify-between border-b border-[#282A2F] pb-2">
              <h3 className="text-xs font-semibold text-[#E8E8E8]">تعریف هدف مالی جدید</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-[#9A9DA5] hover:text-[#E8E8E8] text-xs cursor-pointer"
              >
                انصراف
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-[10px] bg-[#C77A82]/10 border border-[#C77A82]/30 text-xs text-[#C77A82]">
                {formError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">عنوان هدف</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: خرید خودرو، پس‌انداز بازنشستگی"
                className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] focus:outline-none focus:border-[#F0AE55]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-[#9A9DA5]">دسته‌بندی</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] focus:outline-none focus:border-[#F0AE55]"
                >
                  <option value="emergency_fund">صندوق اضطراری</option>
                  <option value="retirement">بازنشستگی</option>
                  <option value="housing">خرید مسکن</option>
                  <option value="investment">سرمایه‌گذاری</option>
                  <option value="travel">سفر و تفریح</option>
                  <option value="other">سایر اهداف</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#9A9DA5]">مبلغ کل هدف (تومان)</label>
                <input
                  type="number"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="200000000"
                  className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] font-mono focus:outline-none focus:border-[#F0AE55]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-[#9A9DA5]">موجودی فعلی (تومان)</label>
                <input
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] font-mono focus:outline-none focus:border-[#F0AE55]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#9A9DA5]">پس‌انداز ماهانه (تومان)</label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  placeholder="5000000"
                  className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] font-mono focus:outline-none focus:border-[#F0AE55]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">تاریخ هدف (سررسید)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] focus:outline-none focus:border-[#F0AE55]"
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-2.5 rounded-[12px] btn-illuminated-amber text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer mt-2"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "ثبت و آغاز هدف"}
            </button>
          </form>
        </div>
      )}

      {/* Contribution Deposit Sheet */}
      {contributingGoal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end justify-center p-3">
          <div className="w-full max-w-sm rounded-[24px] bg-[#141518] border border-[#282A2F] p-5 space-y-3.5 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b border-[#282A2F] pb-2">
              <h3 className="text-xs font-semibold text-[#E8E8E8]">
                افزایش پس‌انداز: {contributingGoal.name}
              </h3>
              <button
                onClick={() => setContributingGoal(null)}
                className="text-[#9A9DA5] hover:text-[#E8E8E8] text-xs cursor-pointer"
              >
                انصراف
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">مبلغ واریزی جدید (تومان)</label>
              <input
                type="number"
                value={contribAmount}
                onChange={(e) => setContribAmount(e.target.value)}
                placeholder="5000000"
                className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] font-mono"
              />
            </div>

            <button
              onClick={() => contributeMutation.mutate()}
              disabled={contributeMutation.isPending}
              className="w-full py-2.5 rounded-[12px] btn-illuminated-amber text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              {contributeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "ثبت و ارتقای درصد تحقق"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
