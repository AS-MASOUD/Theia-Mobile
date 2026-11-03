"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Sparkles,
  Coins,
  DollarSign,
  Layers,
  ShieldAlert,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";
import { MarketRatesResponse, MarketQuote } from "@/types/financial";

export default function MobileMarketsPage() {
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<"all" | "gold" | "currency" | "crypto" | "commodity">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const { data: marketRates, isLoading, refetch, isRefetching } = useQuery<MarketRatesResponse>({
    queryKey: ["mobile-market-rates"],
    queryFn: () => api.getMarketRates(),
    staleTime: 60 * 1000,
  });

  const syncMutation = useMutation({
    mutationFn: () => api.syncMarketRates(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["mobile-market-rates"] });
      setSyncStatus(res.message || "نرخ‌های بازار بروزرسانی شدند.");
      setTimeout(() => setSyncStatus(null), 3500);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در همگام‌سازی بازار";
      setSyncStatus(msg);
      setTimeout(() => setSyncStatus(null), 3500);
    },
  });

  // Extract all quotes
  const allQuotes = useMemo(() => {
    if (!marketRates) return [];
    const list: (MarketQuote & { subcat: string })[] = [];
    (marketRates.gold_and_coins || []).forEach((q) => list.push({ ...q, subcat: "gold" }));
    (marketRates.currencies || []).forEach((q) => list.push({ ...q, subcat: "currency" }));
    (marketRates.cryptocurrency || []).forEach((q) => list.push({ ...q, subcat: "crypto" }));
    (marketRates.commodities || []).forEach((q) => list.push({ ...q, subcat: "commodity" }));
    return list;
  }, [marketRates]);

  const filteredQuotes = useMemo(() => {
    return allQuotes.filter((q) => {
      const matchesCat = activeCategory === "all" || q.subcat === activeCategory;
      const term = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !term ||
        q.symbol.toLowerCase().includes(term) ||
        q.name.toLowerCase().includes(term) ||
        (q.name_en && q.name_en.toLowerCase().includes(term));
      return matchesCat && matchesSearch;
    });
  }, [allQuotes, activeCategory, searchQuery]);

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
          <h1 className="text-sm font-semibold text-[#E8E8E8]">دیده‌بان بازارهای مالی</h1>
          <p className="text-[10px] text-[#F0AE55] font-medium uppercase tracking-wider">
            Live Market Watchboard
          </p>
        </div>

        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="w-9 h-9 rounded-[14px] btn-illuminated-amber flex items-center justify-center text-xs font-semibold active:scale-95 transition-all shadow-[0_0_12px_rgba(240,174,85,0.2)] cursor-pointer"
          title="همگام‌سازی لحظه‌ای نرخ‌ها"
        >
          <RefreshCw className={`w-4 h-4 ${syncMutation.isPending || isRefetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Sync Status Toast */}
      {syncStatus && (
        <div className="p-3 rounded-[14px] bg-[#141518] border border-[rgba(240,174,85,0.3)] text-xs text-[#F0AE55] flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Market Source Banner */}
      <div className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] flex items-center justify-between text-xs text-[#9A9DA5]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#76A98C] shadow-[0_0_6px_rgba(118,169,140,0.8)]" />
          <span>منبع: {marketRates?.sync_source || "Iran Market Data (tgju)"}</span>
        </div>
        {marketRates?.usd_toman_rate && (
          <div className="font-mono text-[11px] text-[#E8E8E8]">
            دلار مرجع: {formatMoney(Number(marketRates.usd_toman_rate))}
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#696D77] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجوی نماد، طلا، سکه، ارز یا رمزارز..."
          className="w-full pr-10 pl-4 py-2.5 rounded-[14px] bg-[#141518] border border-[#282A2F] text-xs text-[#E8E8E8] placeholder-[#696D77] focus:outline-none focus:border-[#F0AE55]/50 transition-colors"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {[
          { key: "all", label: "همه نمادها" },
          { key: "gold", label: "طلا و مسکوکات" },
          { key: "currency", label: "ارزهای آزاد" },
          { key: "crypto", label: "رمزارزها" },
          { key: "commodity", label: "کالاهای پایه و نفت" },
        ].map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key as typeof activeCategory)}
            className={`px-3 py-1.5 rounded-[12px] text-xs font-medium whitespace-nowrap transition-all shrink-0 active:scale-95 cursor-pointer ${
              activeCategory === c.key
                ? "bg-[rgba(240,174,85,0.12)] text-[#F0AE55] border border-[rgba(240,174,85,0.3)] shadow-[0_0_10px_rgba(240,174,85,0.15)]"
                : "bg-[#141518] text-[#9A9DA5] border border-[#282A2F] hover:text-[#E8E8E8]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Quotes Grid */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#9A9DA5] bg-[#141518] border border-[#282A2F] rounded-[20px]">
            در حال بارگذاری نرخ‌های زنده...
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9A9DA5] bg-[#141518] border border-[#282A2F] rounded-[20px]">
            نمادی مطابق با فیلتر یافت نشد.
          </div>
        ) : (
          filteredQuotes.map((item, idx) => {
            const chg = item.change_percent ?? 0;
            const isPos = chg >= 0;
            const priceNum = Number(item.price) || 0;
            const isUsd = item.unit === "دلار";

            return (
              <div
                key={idx}
                className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] hover:border-[#32343A] transition-all flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#E8E8E8]">{item.name}</span>
                    {item.stale && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#C77A82]/10 text-[#C77A82] border border-[#C77A82]/30">
                        کهنه
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#696D77] font-mono uppercase tracking-wider">
                    {item.symbol} {item.name_en ? `• ${item.name_en}` : ""}
                  </div>
                </div>

                <div className="text-left space-y-1">
                  <div className="text-xs font-bold text-[#E8E8E8] font-mono tabular-nums" dir="ltr">
                    {isUsd ? `$${priceNum.toLocaleString()}` : `${Math.round(priceNum).toLocaleString()} ${item.unit}`}
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] text-[10px] font-mono font-bold ${
                      isPos
                        ? "bg-[#76A98C]/15 text-[#76A98C]"
                        : "bg-[#C77A82]/15 text-[#C77A82]"
                    }`}
                    dir="ltr"
                  >
                    {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    <span>{isPos ? "+" : ""}{chg.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
