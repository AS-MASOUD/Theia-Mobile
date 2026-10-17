"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Check, Loader2 } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { api } from "@/lib/api";
import { CashflowCategory } from "@/types/financial";

interface AddCashflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCashflowModal({ isOpen, onClose }: AddCashflowModalProps) {
  const queryClient = useQueryClient();

  const [flowType, setFlowType] = useState<"expense" | "income">("expense");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [errorMsg, setErrorMsg] = useState("");

  const { data: categories } = useQuery<CashflowCategory[]>({
    queryKey: ["cashflow-categories", flowType],
    queryFn: () => api.getCategories(flowType),
    enabled: isOpen,
  });

  React.useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories]);

  const mutation = useMutation({
    mutationFn: () => {
      const numAmount = parseFloat(amount.replace(/,/g, ""));
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("لطفاً مبلغ معتبر وارد کنید.");
      }
      if (!description.trim()) {
        throw new Error("شرح یا بابت الزامی است.");
      }
      if (!categoryId) {
        throw new Error("دسته‌بندی الزامی است.");
      }

      return api.createEntry({
        flow_type: flowType,
        category_id: categoryId,
        amount: String(numAmount),
        currency: "TOMAN",
        entry_date: entryDate,
        description: description.trim(),
        is_recurring: isRecurring,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashflow-summary"] });
      queryClient.invalidateQueries({ queryKey: ["cashflow-entries"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-overview"] });
      onClose();
      setAmount("");
      setDescription("");
      setErrorMsg("");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در ثبت ردیف مالی";
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
      title="ثبت ردیف درآمد یا هزینه"
      description="افزودن مستقیم به دفتر کل جریان نقدینگی و تحلیل بودجه"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorMsg && (
          <div className="p-3 rounded-[12px] bg-[#1B1D21] border border-[#C77A82]/30 text-xs text-[#C77A82]">
            {errorMsg}
          </div>
        )}

        {/* Income / Expense Tabs */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFlowType("expense")}
            className={`py-2 rounded-[12px] text-xs font-medium border transition-all active:scale-95 ${
              flowType === "expense"
                ? "bg-[rgba(199,122,130,0.12)] border-[rgba(199,122,130,0.3)] text-[#C77A82] shadow-[0_0_10px_rgba(199,122,130,0.15)]"
                : "bg-[#1B1D21] border-[#282A2F] text-[#696D77]"
            }`}
          >
            هزینه و مصارف
          </button>
          <button
            type="button"
            onClick={() => setFlowType("income")}
            className={`py-2 rounded-[12px] text-xs font-medium border transition-all active:scale-95 ${
              flowType === "income"
                ? "bg-[rgba(118,169,140,0.12)] border-[rgba(118,169,140,0.3)] text-[#76A98C] shadow-[0_0_10px_rgba(118,169,140,0.15)]"
                : "bg-[#1B1D21] border-[#282A2F] text-[#696D77]"
            }`}
          >
            درآمد و واریز
          </button>
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">مبلغ (تومان)</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="مثال: ۲,۵۰۰,۰۰۰"
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-sm font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            required
            autoFocus
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">سرفصل دسته‌بندی</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
          >
            {categories && categories.length > 0 ? (
              categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))
            ) : (
              <option value="">در حال بارگذاری دسته‌بندی‌ها...</option>
            )}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">شرح رویداد</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="مثال: خرید خواربار، حقوق پروژه، اینترنت..."
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            required
          />
        </div>

        {/* Date & Recurring */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">تاریخ ثبت</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="is_recurring_cb"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 accent-[#F0AE55] rounded"
            />
            <label htmlFor="is_recurring_cb" className="text-xs text-[#9A9DA5]">
              تکرارشونده ماهانه
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-3 rounded-[14px] btn-illuminated-amber text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer mt-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>در حال ثبت...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>ثبت در دفتر کل</span>
            </>
          )}
        </button>
      </form>
    </BottomSheet>
  );
}
