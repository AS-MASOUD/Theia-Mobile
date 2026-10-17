"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  Building,
  Coins,
  TrendingUp,
  Play,
  Layers,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";

export default function MobileAssetsPage() {
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();

  const { data: assets, isLoading: isAssetsLoading } = useQuery({
    queryKey: ["mobile-assets"],
    queryFn: () => api.getAssets(),
  });

  const { data: marketRates, isLoading: isRatesLoading } = useQuery({
    queryKey: ["mobile-market-rates"],
    queryFn: () => api.getMarketRates(),
  });

  const { data: positions } = useQuery({
    queryKey: ["asset-positions"],
    queryFn: () => api.getPositions(),
  });

  const goldQuotes = marketRates?.gold_and_coins || [];
  const currencyQuotes = marketRates?.currencies || [];
  const cryptoQuotes = marketRates?.cryptocurrency || [];

  const allQuotes = [...goldQuotes, ...currencyQuotes, ...cryptoQuotes];

  return (
    <div className="space-y-5">
      {/* Top Header (Screen 4: Cameras / 2 ONLINE • NO ALERTS) */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href="/"
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>

        <div className="text-center">
          <h1 className="text-sm font-semibold text-[#E8E8E8]">فهرست دارایی‌های برخط</h1>
          <p className="text-[11px] text-[#76A98C] font-normal flex items-center justify-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#76A98C] shadow-[0_0_6px_rgba(118,169,140,0.8)]" />
            <span>
              {assets?.length || 4} دارایی فعال • متصل به سرور
            </span>
          </p>
        </div>

        <button
          onClick={() => queryClient.invalidateQueries()}
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#F0AE55] active:scale-95 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAssetsLoading || isRatesLoading ? "animate-spin text-[#F0AE55]" : ""}`} />
        </button>
      </div>

      {/* Primary Visual Asset Card 1 (Screen 4 Translation) */}
      <div className="obsidian-card overflow-hidden group">
        <div className="h-40 w-full relative bg-[radial-gradient(ellipse_at_top_right,rgba(240,174,85,0.08)_0%,transparent_65%),linear-gradient(165deg,#191B20_0%,#141519_100%)] p-4 flex flex-col justify-between border-b border-[rgba(255,255,255,0.06)]">
          {/* Top Row: Live Status Pill & Metadata */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141518]/90 border border-[rgba(240,174,85,0.25)] text-[10px] font-medium text-[#F0AE55] shadow-[0_0_10px_rgba(240,174,85,0.12)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0AE55] shadow-[0_0_6px_rgba(240,174,85,0.8)]" />
              <span>LIVE • ارزش‌گذاری برخط</span>
            </div>
            <span className="text-[10px] text-[#696D77]">
              تهران، نیاوران
            </span>
          </div>

          <div className="z-10 flex items-end justify-between">
            <div>
              <span className="text-xs text-[#9A9DA5] font-normal block">
                ملک مسکونی نیاوران
              </span>
              <span className="text-lg font-normal text-[#E8E8E8] font-number mt-0.5 block">
                ۱۸,۵۰۰,۰۰۰,۰۰۰ تومان
              </span>
            </div>
            <div className="w-8 h-8 rounded-[12px] bg-[#141518] border border-[rgba(240,174,85,0.25)] text-[#F0AE55] flex items-center justify-center shadow-[0_0_12px_rgba(240,174,85,0.15)]">
              <Building className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="p-3 flex items-center justify-between text-xs text-[#9A9DA5] bg-[#141518]">
          <span className="flex items-center gap-1 text-[#76A98C] font-medium drop-shadow-[0_0_6px_rgba(118,169,140,0.25)]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+۳۸٪ ارزش‌افزوده</span>
          </span>
          <span className="text-[11px] text-[#696D77]">سند تک‌برگ</span>
        </div>
      </div>

      {/* Visual Asset Card 2 */}
      <div className="obsidian-card overflow-hidden group">
        <div className="h-40 w-full relative bg-[radial-gradient(ellipse_at_top_right,rgba(240,174,85,0.06)_0%,transparent_65%),linear-gradient(165deg,#191B20_0%,#141519_100%)] p-4 flex flex-col justify-between border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141518]/90 border border-[rgba(240,174,85,0.25)] text-[10px] font-medium text-[#F0AE55] shadow-[0_0_10px_rgba(240,174,85,0.12)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0AE55] shadow-[0_0_6px_rgba(240,174,85,0.8)]" />
              <span>LIVE • مظنه طلا و ارز</span>
            </div>
            <span className="text-[10px] text-[#696D77]">
              صندوق امانات
            </span>
          </div>

          <div className="z-10 flex items-end justify-between">
            <div>
              <span className="text-xs text-[#9A9DA5] font-normal block">
                ذخیره طلا و مسکوکات
              </span>
              <span className="text-lg font-normal text-[#E8E8E8] font-number mt-0.5 block">
                ۲,۴۵۰,۰۰۰,۰۰۰ تومان
              </span>
            </div>
            <div className="w-8 h-8 rounded-[12px] bg-[#141518] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="p-3 flex items-center justify-between text-xs text-[#9A9DA5] bg-[#141518]">
          <span className="flex items-center gap-1 text-[#76A98C] font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+۲۴٪ رشد ۳ ماهه</span>
          </span>
          <span className="text-[11px] text-[#696D77]">پوشش تورم</span>
        </div>
      </div>

      {/* Real Live Market Rates (Screen 4 Translation) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-medium text-[#9A9DA5]">
            نرخ‌های زنده بازار از سرور
          </h3>
          <span className="text-[11px] text-[#F0AE55] font-medium">
            {allQuotes.length} نماد
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {allQuotes.slice(0, 6).map((quote, idx) => {
            const chg = typeof quote.change_percent === "number" ? quote.change_percent : 0;
            const isPos = chg >= 0;

            return (
              <div
                key={quote.symbol || idx}
                className="obsidian-card p-2.5 flex flex-col items-center justify-between text-center relative overflow-hidden group cursor-pointer active:scale-95 transition-colors"
              >
                <div className="w-8 h-8 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] flex items-center justify-center text-[#F0AE55] my-1">
                  <Play className="w-3.5 h-3.5 fill-[#F0AE55] stroke-none ml-0.5" />
                </div>
                <span className="text-xs font-medium text-[#E8E8E8] mt-0.5 truncate max-w-full">
                  {quote.name || quote.symbol}
                </span>
                <span
                  className={`text-[10px] font-number font-medium ${
                    isPos ? "text-[#76A98C]" : "text-[#C77A82]"
                  }`}
                >
                  {isPos ? "+" : ""}
                  {chg}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
