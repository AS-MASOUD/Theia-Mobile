"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Plus,
  Play,
  RotateCcw,
  Target,
  RefreshCw,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";

export default function MobileScenariosPage() {
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();

  const { data: goals, isLoading: isGoalsLoading } = useQuery({
    queryKey: ["mobile-goals"],
    queryFn: () => api.getGoals(),
  });

  const [activeScenarios, setActiveScenarios] = useState<Record<string, boolean>>({
    "1": true,
  });

  const toggleScenario = (id: string) => {
    setActiveScenarios((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const defaultScenarios = [
    {
      id: "1",
      title: "استراتژی بازنشستگی زودهنگام (FIRE)",
      subtitle:
        "واریز مازاد ماهانه به صندوق‌های شاخصی و طلا، سرمایه‌گذاری مجدد سود مرکب برای استقلال مالی در ۴۵ سالگی.",
      assets: "۴ صندوق سرمایه‌گذاری",
    },
    {
      id: "2",
      title: "پروژه تأمین مسکن در ۳ سال آینده",
      subtitle:
        "تخصیص ۷۰٪ پس‌انداز به طلا و مسکوکات، تسویه زودهنگام تسهیلات پرهزینه و افزایش ۱۰ درصدی حاشیه پس‌انداز.",
      assets: "۳ دارایی هدف",
    },
    {
      id: "3",
      title: "سپر ضدتورمی جهش ارزی",
      subtitle:
        "در صورت عبور دلار از مرز کانال مقاومت، هدایت خودکار نقدینگی راکد به ابزارهای متصل به طلا و صندوق طلا.",
      assets: "سیستم هوشمند هشدار",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header (Screen 5: Scenes / CUSTOM AUTOMATION) */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href="/"
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>

        <div className="text-center">
          <h1 className="text-sm font-semibold text-[#E8E8E8]">سناریوهای هوشمند تئا</h1>
          <p className="text-[10px] text-[#F0AE55] font-medium uppercase tracking-wider">
            Custom Automation
          </p>
        </div>

        <button
          onClick={() => queryClient.invalidateQueries()}
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#F0AE55] active:scale-95 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGoalsLoading ? "animate-spin text-[#F0AE55]" : ""}`} />
        </button>
      </div>

      {/* Real Goals from Backend */}
      {goals && goals.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-medium text-[#9A9DA5] px-1">
            اهداف مالی تعریف‌شده در سرور
          </h2>
          <div className="space-y-2">
            {goals.map((goal) => (
              <div key={goal.id} className="obsidian-card p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[#F0AE55]" />
                    <span className="text-xs font-medium text-[#E8E8E8]">{goal.name}</span>
                  </div>
                  <span className="text-xs font-medium text-[#F0AE55] font-number">
                    {goal.progress_percent}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1B1D21] border border-[#282A2F] overflow-hidden">
                  <div
                    style={{ width: `${Math.min(parseFloat(goal.progress_percent || "0"), 100)}%` }}
                    className="h-full bg-[#F0AE55] rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#696D77]">
                  <span>هدف: {formatMoney(goal.target_amount)}</span>
                  <span>تأمین‌شده: {formatMoney(goal.current_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenarios List (Screen 5 Inspiration) */}
      <div className="space-y-3">
        {defaultScenarios.map((item) => {
          const isActive = !!activeScenarios[item.id];

          return (
            <div
              key={item.id}
              className={`obsidian-card p-4 relative overflow-hidden transition-colors ${
                isActive
                  ? "border-[rgba(240,174,85,0.3)] bg-[#141518]"
                  : "border-[#282A2F] bg-[#141518]"
              }`}
            >
              {/* Top Row: Icon & Status Badge */}
              <div className="flex items-center justify-between mb-2.5">
                <div
                  className={`w-9 h-9 rounded-[14px] flex items-center justify-center ${
                    isActive
                      ? "bg-[rgba(240,174,85,0.09)] text-[#F0AE55] border border-[rgba(240,174,85,0.22)]"
                      : "bg-[#1B1D21] text-[#696D77] border border-[#282A2F]"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>

                {isActive ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[rgba(240,174,85,0.09)] border border-[rgba(240,174,85,0.22)] text-[#F0AE55] text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F0AE55]" />
                    <span>فعال</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-normal text-[#696D77] bg-[#1B1D21] px-2 py-0.5 rounded-full border border-[#282A2F]">
                    غیرفعال
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h2 className="text-sm font-semibold text-[#E8E8E8] tracking-tight">
                {item.title}
              </h2>
              <p className="text-xs text-[#9A9DA5] mt-1 leading-relaxed">
                {item.subtitle}
              </p>

              {/* Bottom Row */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#282A2F]">
                <span className="text-[11px] font-normal text-[#696D77] flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#696D77]" />
                  <span>{item.assets}</span>
                </span>

                {isActive ? (
                  <button
                    onClick={() => toggleScenario(item.id)}
                    className="px-4 py-1.5 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#C77A82] text-xs font-medium hover:border-[#C77A82]/40 active:scale-95 transition-colors"
                  >
                    توقف
                  </button>
                ) : (
                  <button
                    onClick={() => toggleScenario(item.id)}
                    className="px-4 py-1.5 rounded-[12px] bg-[#F0AE55] hover:bg-[#F5BA6E] text-[#0D0E10] text-xs font-medium active:scale-95 transition-colors"
                  >
                    فعالسازی
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Dashed "+ Create New Scene" Card */}
        <button
          onClick={() => alert("فرم ثبت سناریو و اهداف مالی جدید به زودی در دسترس خواهد بود.")}
          className="w-full py-5 rounded-[22px] border border-dashed border-[#282A2F] bg-[#141518]/50 hover:border-[#32343A] text-[#9A9DA5] hover:text-[#E8E8E8] flex flex-col items-center justify-center gap-1.5 transition-colors active:scale-98"
        >
          <div className="w-8 h-8 rounded-full bg-[#1B1D21] border border-[#282A2F] flex items-center justify-center">
            <Plus className="w-4 h-4 stroke-[2]" />
          </div>
          <span className="text-xs font-medium">
            ایجاد سناریو و اتوماسیون جدید
          </span>
        </button>
      </div>
    </div>
  );
}
