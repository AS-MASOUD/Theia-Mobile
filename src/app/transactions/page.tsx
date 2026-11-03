"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  RefreshCw,
  Coins,
  Wallet,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { QuickTransactionModal } from "@/components/mobile/transaction-modal";
import { Transaction } from "@/types/financial";

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; isPositive: boolean; color: string }
> = {
  ALL: { label: "همه", icon: SlidersHorizontal, isPositive: true, color: "text-[#9A9DA5]" },
  DEPOSIT: { label: "واریز نقدی", icon: ArrowDownLeft, isPositive: true, color: "text-[#76A98C]" },
  WITHDRAWAL: { label: "برداشت نقدی", icon: ArrowUpRight, isPositive: false, color: "text-[#C77A82]" },
  BUY: { label: "خرید دارایی", icon: ArrowUpRight, isPositive: false, color: "text-[#F0AE55]" },
  SELL: { label: "فروش دارایی", icon: ArrowDownLeft, isPositive: true, color: "text-[#76A98C]" },
  DIVIDEND: { label: "سود نقدی", icon: Coins, isPositive: true, color: "text-[#76A98C]" },
};

export default function MobileTransactionsPage() {
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  const {
    data: transactions,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Transaction[]>({
    queryKey: ["mobile-transactions-list"],
    queryFn: () => api.getTransactions(100, 0),
  });

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((tx) => {
      const matchesType = filterType === "ALL" || tx.transaction_type === filterType;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (tx.notes && tx.notes.toLowerCase().includes(q)) ||
        tx.transaction_type.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (!transactions) return { totalCount: 0, totalInflow: 0, totalOutflow: 0 };
    let inflow = 0;
    let outflow = 0;
    for (const tx of transactions) {
      const amt = parseFloat(String(tx.total_amount || 0)) || 0;
      if (tx.transaction_type === "DEPOSIT" || tx.transaction_type === "SELL" || tx.transaction_type === "DIVIDEND") {
        inflow += amt;
      } else {
        outflow += amt;
      }
    }
    return {
      totalCount: transactions.length,
      totalInflow: inflow,
      totalOutflow: outflow,
    };
  }, [transactions]);

  const typeKeys = ["ALL", "DEPOSIT", "WITHDRAWAL", "BUY", "SELL", "DIVIDEND"];

  return (
    <div className="space-y-5 pb-10">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href="/"
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>

        <div className="text-center">
          <h1 className="text-sm font-semibold text-[#E8E8E8]">دفتر کل تراکنش‌ها</h1>
          <p className="text-[10px] text-[#F0AE55] font-medium uppercase tracking-wider">
            Ledger & Cash Movements
          </p>
        </div>

        <button
          onClick={() => setIsAddTxOpen(true)}
          className="w-9 h-9 rounded-[14px] btn-illuminated-amber flex items-center justify-center text-xs font-semibold active:scale-95 transition-all shadow-[0_0_12px_rgba(240,174,85,0.2)] cursor-pointer"
          title="ثبت تراکنش جدید"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#9A9DA5]">
            <span>مجموع ورودی‌ها</span>
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#76A98C]" />
          </div>
          <div className="text-sm font-semibold text-[#76A98C] font-mono tabular-nums" dir="ltr">
            +{formatMoney(stats.totalInflow)}
          </div>
        </div>

        <div className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#9A9DA5]">
            <span>مجموع خروجی‌ها</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#C77A82]" />
          </div>
          <div className="text-sm font-semibold text-[#C77A82] font-mono tabular-nums" dir="ltr">
            -{formatMoney(stats.totalOutflow)}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#696D77] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجو در شرح یا یادداشت تراکنش‌ها..."
          className="w-full pr-10 pl-4 py-2.5 rounded-[14px] bg-[#141518] border border-[#282A2F] text-xs text-[#E8E8E8] placeholder-[#696D77] focus:outline-none focus:border-[#F0AE55]/50 transition-colors"
        />
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {typeKeys.map((k) => {
          const cfg = TYPE_CONFIG[k] || TYPE_CONFIG.ALL;
          const isActive = filterType === k;
          return (
            <button
              key={k}
              onClick={() => setFilterType(k)}
              className={`px-3 py-1.5 rounded-[12px] text-xs font-medium whitespace-nowrap transition-all shrink-0 active:scale-95 cursor-pointer ${
                isActive
                  ? "bg-[rgba(240,174,85,0.12)] text-[#F0AE55] border border-[rgba(240,174,85,0.3)] shadow-[0_0_10px_rgba(240,174,85,0.15)]"
                  : "bg-[#141518] text-[#9A9DA5] border border-[#282A2F] hover:text-[#E8E8E8]"
              }`}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Transaction List Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-[#9A9DA5] px-1">
          <span>
            {filteredTransactions.length} تراکنش ثبت‌شده
          </span>
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
            در حال بارگذاری تراکنش‌ها...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9A9DA5] bg-[#141518] border border-[#282A2F] rounded-[20px] space-y-2">
            <Coins className="w-8 h-8 mx-auto text-[#696D77] stroke-[1.5]" />
            <p>هیچ تراکنشی مطابق با فیلتر یافت نشد.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const cfg = TYPE_CONFIG[tx.transaction_type] || TYPE_CONFIG.ALL;
            const Icon = cfg.icon;
            const isPos = cfg.isPositive;
            const amountNum = parseFloat(String(tx.total_amount || 0)) || 0;
            const unitPrice = parseFloat(String(tx.unit_price || 0)) || 0;
            const qty = parseFloat(String(tx.quantity || 0)) || 0;
            const fee = parseFloat(String(tx.fee || 0)) || 0;

            return (
              <div
                key={tx.id}
                className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] hover:border-[#32343A] transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 border ${
                        isPos
                          ? "bg-[#76A98C]/10 border-[#76A98C]/30 text-[#76A98C]"
                          : "bg-[#C77A82]/10 border-[#C77A82]/30 text-[#C77A82]"
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#E8E8E8]">
                        {cfg.label}
                      </div>
                      <div className="text-[11px] text-[#9A9DA5] flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-[#696D77]" />
                        <span>{formatDate(tx.transaction_date)}</span>
                        {tx.notes && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[140px] text-[#A0A3AD]">
                              {tx.notes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <div
                      className={`text-xs md:text-sm font-semibold font-mono tabular-nums ${
                        isPos ? "text-[#76A98C]" : "text-[#E8E8E8]"
                      }`}
                      dir="ltr"
                    >
                      {isPos ? "+" : "-"}
                      {formatMoney(amountNum)}
                    </div>
                    <div className="text-[10px] text-[#76A98C] flex items-center justify-end gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>تسویه شده</span>
                    </div>
                  </div>
                </div>

                {/* Extended Details if trade */}
                {(qty > 0 || unitPrice > 0 || fee > 0) && (
                  <div className="pt-2 border-t border-[#282A2F]/60 grid grid-cols-3 gap-2 text-[10px] text-[#9A9DA5] font-mono">
                    {qty > 0 && (
                      <div>
                        <span className="text-[#696D77] block">تعداد:</span>
                        <span className="text-[#E8E8E8]">{qty}</span>
                      </div>
                    )}
                    {unitPrice > 0 && (
                      <div>
                        <span className="text-[#696D77] block">نرخ واحد:</span>
                        <span className="text-[#E8E8E8]">{formatMoney(unitPrice)}</span>
                      </div>
                    )}
                    {fee > 0 && (
                      <div>
                        <span className="text-[#696D77] block">کارمزد:</span>
                        <span className="text-[#E8E8E8]">{formatMoney(fee)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Transaction Modal */}
      <QuickTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => {
          setIsAddTxOpen(false);
          queryClient.invalidateQueries({ queryKey: ["mobile-transactions-list"] });
          queryClient.invalidateQueries({ queryKey: ["mobile-recent-txs"] });
          queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
        }}
      />
    </div>
  );
}
