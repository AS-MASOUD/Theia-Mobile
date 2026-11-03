"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { NotificationItem, NotificationListResponse } from "@/types/auth";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isCheckingTriggers, setIsCheckingTriggers] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    data: notifData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<NotificationListResponse>({
    queryKey: ["mobile-notifications", unreadOnly],
    queryFn: () => api.getNotifications({ limit: 50, unread_only: unreadOnly }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: (data) => {
      setStatusMessage(`تمام ${data.marked_count || 0} اعلان به عنوان خوانده‌شده علامت‌گذاری شدند.`);
      queryClient.invalidateQueries({ queryKey: ["mobile-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      setTimeout(() => setStatusMessage(null), 4000);
    },
  });

  const handleCheckTriggers = async () => {
    setIsCheckingTriggers(true);
    setStatusMessage(null);
    try {
      const generated = await api.checkMarketTriggers();
      queryClient.invalidateQueries({ queryKey: ["mobile-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      if (generated && generated.length > 0) {
        setStatusMessage(`${generated.length} هشدار جدید بر اساس نوسان قیمت‌ها ثبت شد.`);
      } else {
        setStatusMessage("تمام قیمت‌ها در محدوده عادی هستند و هشدار جدیدی ثبت نشد.");
      }
    } catch {
      setStatusMessage("خطا در بررسی هشدارهای لحظه‌ای بازار.");
    } finally {
      setIsCheckingTriggers(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const notifications = notifData?.items || [];
  const unreadCount = notifData?.unread_count || 0;
  const totalCount = notifData?.total || 0;

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          bg: "bg-[rgba(199,122,130,0.12)]",
          border: "border-[rgba(199,122,130,0.3)]",
          text: "text-[#C77A82]",
          icon: AlertTriangle,
          label: "بحرانی",
        };
      case "warning":
        return {
          bg: "bg-[rgba(240,174,85,0.12)]",
          border: "border-[rgba(240,174,85,0.3)]",
          text: "text-[#F0AE55]",
          icon: Flame,
          label: "هشدار",
        };
      case "success":
        return {
          bg: "bg-[rgba(118,169,140,0.12)]",
          border: "border-[rgba(118,169,140,0.3)]",
          text: "text-[#76A98C]",
          icon: CheckCircle2,
          label: "موفق",
        };
      default:
        return {
          bg: "bg-[rgba(255,255,255,0.06)]",
          border: "border-[rgba(255,255,255,0.1)]",
          text: "text-[#9A9DA5]",
          icon: Info,
          label: "اطلاعیه",
        };
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#9A9DA5] hover:text-[#E8E8E8] transition-colors active:scale-95"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-[#E8E8E8] tracking-tight">
              اعلان‌ها و هشدارها
            </h1>
            <p className="text-[11px] text-[#696D77]">
              پیام‌های سیستمی و هشدارهای نوسان دارایی‌ها
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#9A9DA5] hover:text-[#E8E8E8] active:scale-95 transition-colors cursor-pointer"
          title="بروزرسانی"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin text-[#F0AE55]" : ""}`}
          />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="obsidian-card p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#696D77]">خوانده‌نشده</p>
            <p className="text-base font-bold font-number text-[#F0AE55]">
              {unreadCount}
            </p>
          </div>
          <div className="w-8 h-8 rounded-[12px] bg-[rgba(240,174,85,0.1)] border border-[rgba(240,174,85,0.25)] flex items-center justify-center text-[#F0AE55]">
            <Bell className="w-4 h-4" />
          </div>
        </div>

        <div className="obsidian-card p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#696D77]">کل پیام‌ها</p>
            <p className="text-base font-bold font-number text-[#E8E8E8]">
              {totalCount}
            </p>
          </div>
          <div className="w-8 h-8 rounded-[12px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#9A9DA5]">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => markAllReadMutation.mutate()}
          disabled={markAllReadMutation.isPending || unreadCount === 0}
          className="px-3 py-2 rounded-[12px] bg-[#141518] border border-[#282A2F] hover:border-[#F0AE55]/40 text-xs font-medium text-[#E8E8E8] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer active:scale-95"
        >
          <CheckCheck className="w-3.5 h-3.5 text-[#76A98C]" />
          <span>خوانده‌شدن همه</span>
        </button>

        <button
          onClick={handleCheckTriggers}
          disabled={isCheckingTriggers}
          className="px-3 py-2 rounded-[12px] bg-[#141518] border border-[#282A2F] hover:border-[#F0AE55]/40 text-xs font-medium text-[#F0AE55] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer active:scale-95"
        >
          <Zap className={`w-3.5 h-3.5 ${isCheckingTriggers ? "animate-spin" : ""}`} />
          <span>بررسی قیمت بازار</span>
        </button>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="obsidian-card p-3 text-xs text-[#E8E8E8] border-[rgba(240,174,85,0.3)] bg-[rgba(240,174,85,0.05)] animate-in fade-in">
          {statusMessage}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-[#141518] p-1 rounded-[14px] border border-[#282A2F]">
        <button
          onClick={() => setUnreadOnly(false)}
          className={`flex-1 py-1.5 text-xs font-medium rounded-[10px] transition-all cursor-pointer ${
            !unreadOnly
              ? "bg-[#1C1E23] text-[#F0AE55] shadow-sm font-semibold"
              : "text-[#9A9DA5] hover:text-[#E8E8E8]"
          }`}
        >
          تمام اعلان‌ها ({totalCount})
        </button>
        <button
          onClick={() => setUnreadOnly(true)}
          className={`flex-1 py-1.5 text-xs font-medium rounded-[10px] transition-all cursor-pointer ${
            unreadOnly
              ? "bg-[#1C1E23] text-[#F0AE55] shadow-sm font-semibold"
              : "text-[#9A9DA5] hover:text-[#E8E8E8]"
          }`}
        >
          فقط خوانده‌نشده ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="obsidian-card p-8 text-center text-xs text-[#696D77]">
            در حال دریافت اعلان‌ها...
          </div>
        ) : notifications.length === 0 ? (
          <div className="obsidian-card p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] mx-auto">
              <CheckCheck className="w-6 h-6 text-[#76A98C]" />
            </div>
            <p className="text-xs font-medium text-[#E8E8E8]">
              {unreadOnly ? "اعلان خوانده‌نشده‌ای وجود ندارد" : "هیچ اعلانی ثبت نشده است"}
            </p>
            <p className="text-[11px] text-[#696D77]">
              هشدارهای نوسان قیمت و پیام‌های سیستمی اینجا نمایش داده می‌شوند.
            </p>
          </div>
        ) : (
          notifications.map((item: NotificationItem) => {
            const conf = getSeverityConfig(item.severity);
            const Icon = conf.icon;

            return (
              <div
                key={item.id}
                className={`obsidian-card p-3.5 transition-all space-y-2 ${
                  !item.is_read
                    ? "border-[rgba(240,174,85,0.25)] bg-[#141518]/90"
                    : "opacity-80"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-[10px] ${conf.bg} border ${conf.border} flex items-center justify-center ${conf.text} shrink-0 mt-0.5`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-[#E8E8E8]">
                          {item.title}
                        </h4>
                        {!item.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F0AE55] shadow-[0_0_6px_rgba(240,174,85,0.8)]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#9A9DA5] leading-relaxed mt-0.5">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full ${conf.bg} ${conf.text} font-medium shrink-0`}
                  >
                    {conf.label}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[10px] text-[#696D77]">
                  <span className="font-number">
                    {new Date(item.created_at).toLocaleDateString("fa-IR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  {!item.is_read && (
                    <button
                      onClick={() => markReadMutation.mutate(item.id)}
                      disabled={markReadMutation.isPending}
                      className="text-[#F0AE55] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>خوانده شد</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
