"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Check, Loader2, Target } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { api } from "@/lib/api";
import { GoalCategory } from "@/types/financial";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("EMERGENCY_FUND");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [monthlyContribution, setMonthlyContribution] = useState("0");
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: goalCategories } = useQuery<GoalCategory[]>({
    queryKey: ["goal-categories"],
    queryFn: () => api.getGoalCategories(),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const target = parseFloat(targetAmount.replace(/,/g, ""));
      if (!name.trim()) throw new Error("نام هدف مالی الزامی است.");
      if (isNaN(target) || target <= 0) throw new Error("مبلغ هدف باید بزرگتر از صفر باشد.");

      const current = parseFloat(currentAmount.replace(/,/g, "")) || 0;
      const monthly = parseFloat(monthlyContribution.replace(/,/g, "")) || 0;

      return api.createGoal({
        name: name.trim(),
        category,
        target_amount: String(target),
        current_amount: String(current),
        monthly_contribution: String(monthly),
        currency: "TOMAN",
        target_date: targetDate,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      onClose();
      setName("");
      setTargetAmount("");
      setCurrentAmount("0");
      setMonthlyContribution("0");
      setNotes("");
      setErrorMsg("");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در ثبت هدف مالی";
      setErrorMsg(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    mutation.mutate();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="ثبت هدف مالی یا سناریوی هدفمند"
      description="تعریف برنامه انباشت ثروت و رهگیری درصد تحقق آن"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorMsg && (
          <div className="p-3 rounded-[12px] bg-[#1B1D21] border border-[#C77A82]/30 text-xs text-[#C77A82]">
            {errorMsg}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">عنوان هدف مالی</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: خرید مسکن، صندوق بازنشستگی، ارتقای خودرو..."
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">دسته‌بندی</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            >
              {goalCategories && goalCategories.length > 0 ? (
                goalCategories.map((gc) => (
                  <option key={gc.id} value={gc.code}>
                    {gc.label}
                  </option>
                ))
              ) : (
                <>
                  <option value="RETIREMENT">بازنشستگی و استقلال مالی</option>
                  <option value="HOME">تأمین مسکن و ملک</option>
                  <option value="EMERGENCY_FUND">صندوق اضطراری</option>
                  <option value="INVESTMENT">سرمایه‌گذاری طلا و سهام</option>
                  <option value="VEHICLE">خرید یا تبدیل خودرو</option>
                  <option value="OTHER">سایر اهداف</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">تاریخ سررسید هدف</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">مبلغ نهایی هدف (تومان)</label>
          <input
            type="text"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="مثال: ۵۰۰,۰۰۰,۰۰۰"
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">موجودی فعلی (تومان)</label>
            <input
              type="text"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="۰"
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:outline-none focus:border-[#F0AE55]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">پس‌انداز ماهانه (تومان)</label>
            <input
              type="text"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              placeholder="مثال: ۱۰,۰۰۰,۰۰۰"
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:outline-none focus:border-[#F0AE55]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">توضیحات و استراتژی</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="یادداشت استراتژیک..."
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-3 rounded-[14px] btn-illuminated-amber text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer mt-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>در حال ایجاد...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>ثبت هدف در سرور</span>
            </>
          )}
        </button>
      </form>
    </BottomSheet>
  );
}
