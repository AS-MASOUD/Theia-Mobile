"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ArrowDownLeft, ArrowUpRight, Check, Loader2 } from "lucide-react";
import { BottomSheet } from "./bottom-sheet";
import { api } from "@/lib/api";
import { useCurrency } from "@/components/currency-context";
import { Account, Asset } from "@/types/financial";

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickTransactionModal({ isOpen, onClose }: QuickTransactionModalProps) {
  const queryClient = useQueryClient();
  const { currency: activeCurrency } = useCurrency();

  const [txType, setTxType] = useState<"INCOME" | "EXPENSE" | "BUY" | "SELL">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["mobile-accounts"],
    queryFn: () => api.getAccounts(),
    enabled: isOpen,
  });

  const { data: assets } = useQuery<Asset[]>({
    queryKey: ["mobile-assets-list"],
    queryFn: () => api.getAssets(),
    enabled: isOpen,
  });

  // Set default account when accounts load
  React.useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const mutation = useMutation({
    mutationFn: async () => {
      const numAmount = parseFloat(amount.replace(/,/g, ""));
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("لطفاً مبلغ معتبر وارد کنید.");
      }

      let accId = selectedAccountId;
      if (!accId && accounts && accounts.length > 0) {
        accId = accounts[0].id;
      }

      if (!accId) {
        // Create a default primary account if none exists
        const newAcc = await api.createAccount({
          name: "حساب اصلی",
          account_type: "SAVINGS",
          currency: "TOMAN",
          initial_balance: "0",
        });
        accId = newAcc.id;
      }

      const payload: Record<string, unknown> = {
        account_id: accId,
        transaction_type: txType,
        total_amount: String(numAmount),
        fee: "0",
        currency: "TOMAN",
        transaction_date: new Date().toISOString(),
        notes: notes.trim() || undefined,
      };

      if ((txType === "BUY" || txType === "SELL") && selectedAssetId) {
        payload.asset_id = selectedAssetId;
        if (quantity) payload.quantity = quantity;
        if (unitPrice) payload.unit_price = unitPrice;
      }

      return api.createTransaction(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-recent-txs"] });
      queryClient.invalidateQueries({ queryKey: ["cashflow-summary"] });
      queryClient.invalidateQueries({ queryKey: ["asset-positions"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-snapshots"] });
      onClose();
      setAmount("");
      setNotes("");
      setQuantity("");
      setUnitPrice("");
      setErrorMsg("");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در ثبت تراکنش";
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
      title="ثبت رویداد مالی جدید"
      description="ثبت تراکنش زنده با تأثیر مستقیم بر ارزش خالص و جریان نقد"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-[12px] bg-[#1B1D21] border border-[#C77A82]/30 text-xs text-[#C77A82]">
            {errorMsg}
          </div>
        )}

        {/* Transaction Type Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setTxType("EXPENSE")}
            className={`py-2 rounded-[12px] text-xs font-medium border transition-all active:scale-95 ${
              txType === "EXPENSE"
                ? "bg-[rgba(199,122,130,0.12)] border-[rgba(199,122,130,0.3)] text-[#C77A82] shadow-[0_0_10px_rgba(199,122,130,0.15)]"
                : "bg-[#1B1D21] border-[#282A2F] text-[#696D77]"
            }`}
          >
            هزینه
          </button>
          <button
            type="button"
            onClick={() => setTxType("INCOME")}
            className={`py-2 rounded-[12px] text-xs font-medium border transition-all active:scale-95 ${
              txType === "INCOME"
                ? "bg-[rgba(118,169,140,0.12)] border-[rgba(118,169,140,0.3)] text-[#76A98C] shadow-[0_0_10px_rgba(118,169,140,0.15)]"
                : "bg-[#1B1D21] border-[#282A2F] text-[#696D77]"
            }`}
          >
            درآمد
          </button>
          <button
            type="button"
            onClick={() => setTxType("BUY")}
            className={`py-2 rounded-[12px] text-xs font-medium border transition-all active:scale-95 ${
              txType === "BUY"
                ? "bg-[rgba(240,174,85,0.12)] border-[rgba(240,174,85,0.3)] text-[#F0AE55] shadow-[0_0_10px_rgba(240,174,85,0.15)]"
                : "bg-[#1B1D21] border-[#282A2F] text-[#696D77]"
            }`}
          >
            خرید دارایی
          </button>
          <button
            type="button"
            onClick={() => setTxType("SELL")}
            className={`py-2 rounded-[12px] text-xs font-medium border transition-all active:scale-95 ${
              txType === "SELL"
                ? "bg-[rgba(136,169,188,0.12)] border-[rgba(136,169,188,0.3)] text-[#88A9BC] shadow-[0_0_10px_rgba(136,169,188,0.15)]"
                : "bg-[#1B1D21] border-[#282A2F] text-[#696D77]"
            }`}
          >
            فروش
          </button>
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">مبلغ کل (تومان)</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="مثال: ۵,۰۰۰,۰۰۰"
            className="w-full px-3 py-2.5 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-sm font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            required
            autoFocus
          />
        </div>

        {/* Account Selector */}
        {accounts && accounts.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">حساب بانکی / منبع</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.account_type})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Asset Fields for BUY/SELL */}
        {(txType === "BUY" || txType === "SELL") && assets && assets.length > 0 && (
          <div className="space-y-3 p-3 rounded-[14px] bg-[#1B1D21] border border-[#282A2F]">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#9A9DA5]">انتخاب دارایی</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-3 py-2 rounded-[12px] bg-[#141518] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
              >
                <option value="">انتخاب دارایی...</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#9A9DA5]">تعداد / مقدار</label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="مثال: ۱.۵"
                  className="w-full px-3 py-1.5 rounded-[10px] bg-[#141518] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:outline-none focus:border-[#F0AE55]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#9A9DA5]">قیمت واحد (تومان)</label>
                <input
                  type="text"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="قیمت هر واحد"
                  className="w-full px-3 py-1.5 rounded-[10px] bg-[#141518] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:outline-none focus:border-[#F0AE55]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">یادداشت یا بابت</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: حقوق ماهانه، خرید طلا، پرداخت اجاره..."
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
          />
        </div>

        {/* Submit Button */}
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
              <span>تأیید و ثبت رویداد</span>
            </>
          )}
        </button>
      </form>
    </BottomSheet>
  );
}
