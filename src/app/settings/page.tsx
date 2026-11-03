"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Settings,
  Server,
  Database,
  RefreshCw,
  Camera,
  CheckCircle2,
  LogOut,
  Moon,
  Coins,
  ShieldCheck,
  User,
  HardDrive,
  Trash2,
  Sparkles,
  Info,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-context";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";

export default function MobileSettingsPage() {
  const { user, logout } = useAuth();
  const { currency, toggleCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const [snapshotMsg, setSnapshotMsg] = useState<string | null>(null);

  // System Health
  const { data: health, isLoading: isHealthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ["mobile-system-health"],
    queryFn: () => api.checkReady(),
  });

  // Snapshot Mutation
  const snapshotMutation = useMutation({
    mutationFn: () => api.recordSnapshot(),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setSnapshotMsg("اسنپ‌شات ترازنامه با موفقیت ثبت شد.");
      setTimeout(() => setSnapshotMsg(null), 3000);
    },
    onError: () => {
      setSnapshotMsg("خطا در ثبت اسنپ‌شات.");
      setTimeout(() => setSnapshotMsg(null), 3000);
    },
  });

  const isDbConnected = health?.components?.database === "connected";
  const isRedisConnected = health?.components?.redis === "connected";

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
          <h1 className="text-sm font-semibold text-[#E8E8E8]">تنظیمات پلتفرم</h1>
          <p className="text-[10px] text-[#F0AE55] font-medium uppercase tracking-wider">
            System & Infrastructure
          </p>
        </div>

        <button
          onClick={() => refetchHealth()}
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors"
          title="بروزرسانی وضعیت"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Snapshot Confirmation Alert */}
      {snapshotMsg && (
        <div className="p-3.5 rounded-[16px] bg-[#76A98C]/15 border border-[#76A98C]/30 text-xs text-[#76A98C] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{snapshotMsg}</span>
        </div>
      )}

      {/* User Session Profile Card */}
      <div className="p-4 rounded-[22px] bg-[#141518] border border-[#282A2F] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[14px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] font-semibold text-base flex items-center justify-center">
            {user?.full_name ? user.full_name[0] : "ت"}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#E8E8E8]">
              {user?.full_name || "کاربر پلتفرم تئا"}
            </h3>
            <div className="text-[11px] text-[#9A9DA5]">
              {user?.email || "حساب معتبر"} • نقش: {user?.role || "کاربر"}
            </div>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="px-3 py-1.5 rounded-[12px] bg-[#C77A82]/10 border border-[#C77A82]/30 text-[#C77A82] text-xs font-medium flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>خروج</span>
        </button>
      </div>

      {/* Display & Currency Preferences */}
      <div className="p-4 rounded-[22px] bg-[#141518] border border-[#282A2F] space-y-3.5">
        <h3 className="text-xs font-semibold text-[#E8E8E8] flex items-center gap-2">
          <Coins className="w-4 h-4 text-[#F0AE55]" />
          <span>ترجیحات نمایش مالی</span>
        </h3>

        <div className="flex items-center justify-between p-3 rounded-[16px] bg-[#1B1D21] border border-[#282A2F]">
          <div>
            <span className="text-xs font-medium text-[#E8E8E8] block">واحد پول پیش‌فرض</span>
            <span className="text-[10px] text-[#9A9DA5]">تغییر واحد ریالی (تومان) به دلاری (USD)</span>
          </div>

          <button
            onClick={() => toggleCurrency()}
            className="px-3 py-1.5 rounded-[10px] btn-illuminated-amber text-xs font-semibold active:scale-95 transition-all cursor-pointer"
          >
            {currency === "TOMAN" ? "تومان (IRT)" : "دلار (USD)"}
          </button>
        </div>
      </div>

      {/* Snapshot Management */}
      <div className="p-4 rounded-[22px] bg-[#141518] border border-[#282A2F] space-y-3.5">
        <h3 className="text-xs font-semibold text-[#E8E8E8] flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#F0AE55]" />
          <span>ثبت دستی اسنپ‌شات ترازنامه</span>
        </h3>
        <p className="text-[11px] text-[#9A9DA5] leading-relaxed">
          سیستم به صورت خودکار تغییرات را ذخیره می‌کند؛ در صورت نیاز به ثبت مقطع زمانی مشخص برای نمودارهای تحلیلی، می‌توانید اسنپ‌شات دستی ایجاد فرمایید.
        </p>

        <button
          onClick={() => snapshotMutation.mutate()}
          disabled={snapshotMutation.isPending}
          className="w-full py-2.5 rounded-[14px] bg-[#1B1D21] hover:bg-[#222429] border border-[#282A2F] text-xs font-semibold text-[#E8E8E8] flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <Camera className="w-4 h-4 text-[#F0AE55]" />
          <span>
            {snapshotMutation.isPending ? "در حال ثبت اسنپ‌شات..." : "ثبت اسنپ‌شات لحظه‌ای ترازنامه"}
          </span>
        </button>
      </div>

      {/* Infrastructure & Database Health */}
      <div className="p-4 rounded-[22px] bg-[#141518] border border-[#282A2F] space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#282A2F] pb-2.5">
          <h3 className="text-xs font-semibold text-[#E8E8E8] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#76A98C]" />
            <span>سلامت زیرساخت و ارتباطات بک‌اند</span>
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              health?.status === "ready"
                ? "bg-[#76A98C]/15 text-[#76A98C] border-[#76A98C]/30"
                : "bg-[#F0AE55]/15 text-[#F0AE55] border-[#F0AE55]/30"
            }`}
          >
            {health?.status === "ready" ? "عملیاتی" : "در حال اتصال"}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-[14px] bg-[#1B1D21] border border-[#282A2F] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#9A9DA5]" />
              <span className="text-[#E8E8E8]">پایگاه داده PostgreSQL</span>
            </div>
            <span
              className={`text-[11px] font-medium flex items-center gap-1.5 ${
                isDbConnected ? "text-[#76A98C]" : "text-[#C77A82]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isDbConnected ? "bg-[#76A98C]" : "bg-[#C77A82]"}`}
              />
              <span>{isDbConnected ? "متصل و فعال" : "قطع اتصال"}</span>
            </span>
          </div>

          <div className="p-3 rounded-[14px] bg-[#1B1D21] border border-[#282A2F] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#9A9DA5]" />
              <span className="text-[#E8E8E8]">کش سرور Redis</span>
            </div>
            <span
              className={`text-[11px] font-medium flex items-center gap-1.5 ${
                isRedisConnected ? "text-[#76A98C]" : "text-[#C77A82]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isRedisConnected ? "bg-[#76A98C]" : "bg-[#C77A82]"}`}
              />
              <span>{isRedisConnected ? "متصل و فعال" : "قطع اتصال"}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
