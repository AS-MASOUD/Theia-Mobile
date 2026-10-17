"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { api } from "@/lib/api";
import { useCurrency } from "@/components/currency-context";
import { AssetPosition } from "@/types/financial";

interface EditPositionModalProps {
  position: AssetPosition | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditPositionModal({
  position,
  isOpen,
  onClose,
}: EditPositionModalProps) {
  const queryClient = useQueryClient();
  const { formatMoney } = useCurrency();

  const [quantity, setQuantity] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (position) {
      setQuantity(position.quantity || "");
      setCostBasis(position.average_cost_basis || "");
      setConfirmDelete(false);
      setErrorMsg("");
    }
  }, [position]);

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!position) throw new Error("موقعیتی انتخاب نشده است.");
      const q = parseFloat(quantity.replace(/,/g, ""));
      const c = parseFloat(costBasis.replace(/,/g, ""));
      if (isNaN(q) || q <= 0) throw new Error("تعداد باید بزرگتر از صفر باشد.");
      return api.updatePosition(position.id, {
        quantity: String(q),
        average_cost_basis: String(isNaN(c) ? 0 : c),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asset-positions"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-overview"] });
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در بروزرسانی موقعیت";
      setErrorMsg(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!position) throw new Error("موقعیتی انتخاب نشده است.");
      return api.deletePosition(position.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asset-positions"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-overview"] });
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در حذف موقعیت";
      setErrorMsg(msg);
    },
  });

  if (!position) return null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`مدیریت موقعیت: ${position.asset_name || position.asset_symbol}`}
      description="تنظیم تعداد واحدهای نگهداری‌شده یا بهای تمام‌شده خرید"
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-[12px] bg-[#1B1D21] border border-[#C77A82]/30 text-xs text-[#C77A82]">
            {errorMsg}
          </div>
        )}

        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-[16px] bg-[#1B1D21] border border-[#282A2F]">
          <div>
            <span className="text-[10px] text-[#696D77] block">ارزش جاری کل</span>
            <span className="text-xs font-semibold text-[#E8E8E8] font-number mt-0.5 block">
              {formatMoney(position.current_value)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#696D77] block">سود/زیان تحقق‌نیافته</span>
            <span
              className={`text-xs font-semibold font-number mt-0.5 block ${
                parseFloat(position.unrealized_pnl) >= 0
                  ? "text-[#76A98C]"
                  : "text-[#C77A82]"
              }`}
            >
              {position.unrealized_pnl_percent}% ({formatMoney(position.unrealized_pnl)})
            </span>
          </div>
        </div>

        {/* Edit Fields */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">
            تعداد یا حجم دارایی
          </label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="مثال: ۵.۲"
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">
            میانگین بهای خرید هر واحد (تومان)
          </label>
          <input
            type="text"
            value={costBasis}
            onChange={(e) => setCostBasis(e.target.value)}
            placeholder="بهای تمام‌شده"
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
          />
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="w-full py-3 rounded-[14px] btn-illuminated-amber text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال ذخیره...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>بروزرسانی موقعیت</span>
              </>
            )}
          </button>

          {confirmDelete ? (
            <div className="p-3 rounded-[14px] bg-[#1B1D21] border border-[#C77A82]/40 space-y-2 text-center animate-in fade-in">
              <p className="text-xs text-[#C77A82] flex items-center justify-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>آیا از حذف این موقعیت دارایی اطمینان دارید؟</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-1.5 rounded-[10px] bg-[#C77A82] text-white text-xs font-medium active:scale-95 transition-all"
                >
                  {deleteMutation.isPending ? "در حال حذف..." : "بله، حذف کن"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-1.5 rounded-[10px] bg-[#222327] text-[#9A9DA5] text-xs font-medium active:scale-95 transition-all"
                >
                  انصراف
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2.5 rounded-[14px] bg-[#1B1D21] border border-[#282A2F] text-[#C77A82] hover:border-[#C77A82]/30 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-98 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف این موقعیت از پورتفوی</span>
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
