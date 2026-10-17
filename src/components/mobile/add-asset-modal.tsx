"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Check, Loader2 } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { api } from "@/lib/api";
import { AssetClass } from "@/types/financial";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  const queryClient = useQueryClient();

  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [assetClass, setAssetClass] = useState("commodity");
  const [currency, setCurrency] = useState("TOMAN");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: assetClasses } = useQuery<AssetClass[]>({
    queryKey: ["asset-classes"],
    queryFn: () => api.getAssetClasses(),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!symbol.trim() || !name.trim()) {
        throw new Error("نام و نماد دارایی الزامی هستند.");
      }
      return api.createAsset({
        symbol: symbol.toUpperCase().trim(),
        name: name.trim(),
        asset_class: assetClass,
        currency,
        initial_price: price.replace(/,/g, "") || "0",
        is_active: isActive,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-assets"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      queryClient.invalidateQueries({ queryKey: ["asset-positions"] });
      onClose();
      setSymbol("");
      setName("");
      setPrice("");
      setNotes("");
      setErrorMsg("");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در افزودن دارایی";
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
      title="افزودن دارایی جدید"
      description="ثبت دارایی شخصی جهت رهگیری ارزش و ارزش‌گذاری روزانه"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorMsg && (
          <div className="p-3 rounded-[12px] bg-[#1B1D21] border border-[#C77A82]/30 text-xs text-[#C77A82]">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">نماد اختصاری</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="مثال: GOLD, USD, TEH-PROP"
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number uppercase focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">نام دارایی</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: سکه تمام امامی، آپارتمان"
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">دسته‌بندی دارایی</label>
            <select
              value={assetClass}
              onChange={(e) => setAssetClass(e.target.value)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            >
              {assetClasses && assetClasses.length > 0 ? (
                assetClasses.map((ac) => (
                  <option key={ac.id} value={ac.code}>
                    {ac.label}
                  </option>
                ))
              ) : (
                <>
                  <option value="commodity">طلا و فلزات گرانبها</option>
                  <option value="currency">ارزهای خارجی</option>
                  <option value="real_estate">املاک و مستغلات</option>
                  <option value="stock">سهام و صندوق‌ها</option>
                  <option value="crypto">رمزارزها</option>
                  <option value="cash">وجوه نقد و بانکی</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">واحد پولی مبنا</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            >
              <option value="TOMAN">تومان (TOMAN)</option>
              <option value="USD">دلار آمریکا (USD)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">ارزش یا قیمت اولیه</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="مثال: ۵۴,۰۰۰,۰۰۰"
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">توضیحات و مشخصات</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="محل نگهداری، جزئیات سند، شماره قرارداد..."
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="is_active_asset"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-[#F0AE55] rounded"
          />
          <label htmlFor="is_active_asset" className="text-xs text-[#9A9DA5]">
            دارایی فعال در سبد سرمایه‌گذاری
          </label>
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
              <span>ثبت دارایی در سامانه</span>
            </>
          )}
        </button>
      </form>
    </BottomSheet>
  );
}
