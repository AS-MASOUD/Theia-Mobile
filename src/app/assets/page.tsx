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
  DollarSign,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";
import { AddAssetModal } from "@/components/mobile/add-asset-modal";
import { Asset, MarketQuote } from "@/types/financial";

export default function MobileAssetsPage() {
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const { data: assets, isLoading: isAssetsLoading, refetch: refetchAssets } = useQuery({
    queryKey: ["mobile-assets"],
    queryFn: () => api.getAssets(),
  });

  const { data: marketRates, isLoading: isRatesLoading } = useQuery({
    queryKey: ["mobile-market-rates"],
    queryFn: () => api.getMarketRates(),
    staleTime: 60 * 1000,
  });

  // Sync market rates with backend
  const syncMutation = useMutation({
    mutationFn: () => api.syncMarketRates(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["mobile-market-rates"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-assets"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      setSyncStatus(res.message || "نرخ‌های بازار بروزرسانی شدند");
      setTimeout(() => setSyncStatus(null), 3500);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در همگام‌سازی بازار";
      setSyncStatus(msg);
      setTimeout(() => setSyncStatus(null), 3500);
    },
  });

  // Toggle asset active status
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.updateAsset(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-assets"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      queryClient.invalidateQueries({ queryKey: ["asset-positions"] });
    },
  });

  // Delete asset
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-assets"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      queryClient.invalidateQueries({ queryKey: ["asset-positions"] });
    },
  });

  const activeAssets = (assets || []).filter((a) => a.is_active);
  const inactiveAssets = (assets || []).filter((a) => !a.is_active);

  const goldQuotes = marketRates?.gold_and_coins || [];
  const currencyQuotes = marketRates?.currencies || [];
  const cryptoQuotes = marketRates?.cryptocurrency || [];
  const allQuotes: MarketQuote[] = [...goldQuotes, ...currencyQuotes, ...cryptoQuotes];

  const getAssetIcon = (assetClass: string) => {
    switch (assetClass?.toLowerCase()) {
      case "real_estate":
        return <Building className="w-4 h-4" />;
      case "commodity":
      case "gold":
        return <Coins className="w-4 h-4" />;
      case "stock":
        return <TrendingUp className="w-4 h-4" />;
      case "crypto":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const getAssetClassLabel = (assetClass: string) => {
    const map: Record<string, string> = {
      real_estate: "املاک و مستغلات",
      commodity: "طلا و مسکوکات",
      currency: "ارزهای خارجی",
      stock: "سهام و بورس",
      crypto: "رمزارز",
      cash: "نقد و بانکی",
    };
    return map[assetClass?.toLowerCase()] || assetClass || "سایر";
  };

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
          <h1 className="text-sm font-semibold text-[#E8E8E8]">فهرست دارایی‌های برخط</h1>
          <p className="text-[11px] text-[#76A98C] font-normal flex items-center justify-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#76A98C] shadow-[0_0_6px_rgba(118,169,140,0.8)]" />
            <span>
              {activeAssets.length} دارایی فعال • متصل به سرور
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#F0AE55] active:scale-95 transition-colors cursor-pointer"
            title="همگام‌سازی مظنه‌های زنده"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                syncMutation.isPending || isAssetsLoading ? "animate-spin text-[#F0AE55]" : ""
              }`}
            />
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="w-9 h-9 rounded-[14px] bg-[rgba(240,174,85,0.08)] border border-[rgba(240,174,85,0.25)] flex items-center justify-center text-[#F0AE55] active:scale-95 transition-colors cursor-pointer"
            title="افزودن دارایی جدید"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div className="p-2.5 rounded-[12px] bg-[#141518] border border-[rgba(240,174,85,0.25)] text-center text-xs text-[#F0AE55] animate-in fade-in">
          {syncStatus}
        </div>
      )}

      {/* Real Assets from Database */}
      <div className="space-y-3">
        {isAssetsLoading ? (
          <div className="obsidian-card p-8 text-center text-xs text-[#696D77]">
            در حال بارگذاری فهرست دارایی‌ها از سرور...
          </div>
        ) : assets && assets.length > 0 ? (
          assets.map((asset) => {
            const priceNum = parseFloat(asset.current_price || "0");

            return (
              <div key={asset.id} className="obsidian-card overflow-hidden group">
                <div className="p-4 relative bg-[radial-gradient(ellipse_at_top_right,rgba(240,174,85,0.06)_0%,transparent_65%),linear-gradient(165deg,#191B20_0%,#141519_100%)] border-b border-[rgba(255,255,255,0.06)] flex flex-col justify-between gap-3">
                  {/* Top Row: Live Status Pill & Symbol */}
                  <div className="flex items-center justify-between z-10">
                    <button
                      type="button"
                      onClick={() =>
                        toggleActiveMutation.mutate({
                          id: asset.id,
                          is_active: !asset.is_active,
                        })
                      }
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-medium transition-colors cursor-pointer ${
                        asset.is_active
                          ? "bg-[#141518]/90 border-[rgba(240,174,85,0.25)] text-[#F0AE55] shadow-[0_0_10px_rgba(240,174,85,0.12)]"
                          : "bg-[#141518]/90 border-[#282A2F] text-[#696D77]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          asset.is_active
                            ? "bg-[#F0AE55] shadow-[0_0_6px_rgba(240,174,85,0.8)]"
                            : "bg-[#696D77]"
                        }`}
                      />
                      <span>{asset.is_active ? "LIVE • فعال" : "غیرفعال"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#9A9DA5] font-number uppercase">
                        {asset.symbol}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`آیا از حذف دارایی «${asset.name}» اطمینان دارید؟`)) {
                            deleteMutation.mutate(asset.id);
                          }
                        }}
                        className="text-[#696D77] hover:text-[#C77A82] p-1 transition-colors cursor-pointer"
                        title="حذف دارایی"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title and Value */}
                  <div className="z-10 flex items-end justify-between">
                    <div>
                      <span className="text-xs text-[#9A9DA5] font-normal block">
                        {asset.name}
                      </span>
                      <span className="text-lg font-normal text-[#E8E8E8] font-number mt-0.5 block">
                        {formatMoney(priceNum)}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-[12px] bg-[#141518] border border-[rgba(240,174,85,0.25)] text-[#F0AE55] flex items-center justify-center shadow-[0_0_12px_rgba(240,174,85,0.15)]">
                      {getAssetIcon(asset.asset_class)}
                    </div>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="p-3 flex items-center justify-between text-xs text-[#9A9DA5] bg-[#141518]">
                  <span className="flex items-center gap-1 text-[#76A98C] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#76A98C]" />
                    <span>{getAssetClassLabel(asset.asset_class)}</span>
                  </span>
                  <span className="text-[11px] text-[#696D77]">
                    {asset.notes || (asset.currency === "USD" ? "ارز مرجع: USD" : "ارز مرجع: تومان")}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="obsidian-card p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-[16px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#E8E8E8]">
                دارایی در سامانه ثبت نشده است
              </h3>
              <p className="text-[11px] text-[#696D77] mt-0.5">
                با ثبت اولین دارایی، ارزش لحظه‌ای و درصد تغییرات آن را رصد کنید.
              </p>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 rounded-[12px] btn-illuminated-amber text-xs font-medium inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2]" />
              <span>افزودن دارایی جدید</span>
            </button>
          </div>
        )}
      </div>

      {/* Real Live Market Rates from Server */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-medium text-[#9A9DA5]">
            نرخ‌های زنده بازار از سرور
          </h3>
          <span className="text-[11px] text-[#F0AE55] font-medium font-number">
            {allQuotes.length} نماد زنده
          </span>
        </div>

        {allQuotes.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {allQuotes.slice(0, 9).map((quote, idx) => {
              const chg =
                typeof quote.change_percent === "number" ? quote.change_percent : 0;
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
                  <span className="text-[10px] text-[#9A9DA5] font-number truncate max-w-full">
                    {formatMoney(quote.price_toman || quote.price)}
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
        ) : (
          <div className="obsidian-card p-4 text-center text-xs text-[#696D77]">
            نرخی از بازار دریافت نشد. با کلیک بر دکمه همگام‌سازی بالا، نرخ‌ها را بروزرسانی کنید.
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
