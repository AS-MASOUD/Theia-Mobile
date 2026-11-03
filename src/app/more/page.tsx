"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  Flame,
  GitBranch,
  ShieldAlert,
  Target,
  ArrowLeftRight,
  Zap,
  Globe2,
  Sparkles,
  Eye,
  Bell,
  Settings,
  User,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/components/auth-context";

interface MenuItem {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "amber" | "emerald" | "coral" | "neutral";
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function MoreHubPage() {
  const { user } = useAuth();

  const sections: MenuSection[] = [
    {
      title: "تحلیل، پیش‌بینی و سلامت مالی",
      items: [
        {
          title: "مسیر رشد ثروت",
          description: "شبیه‌ساز تحلیلی ارزش خالص و افق‌های زمانی",
          href: "/wealth-trajectory",
          icon: TrendingUp,
          badge: "پویا",
          badgeVariant: "amber",
        },
        {
          title: "نسبت‌های سلامت مالی",
          description: "تحلیل اهرم، تاب‌آوری و کفایت نقدینگی",
          href: "/analytics",
          icon: BarChart3,
        },
        {
          title: "اقلیم مالی و تاب‌آوری",
          description: "امتیاز استرس، جریان آزاد و تاب‌آوری اقتصادی",
          href: "/health",
          icon: Flame,
        },
        {
          title: "سناریوسازی و شبیه‌ساز",
          description: "مدل‌سازی بحران و بازده دارایی‌ها",
          href: "/scenarios",
          icon: GitBranch,
        },
      ],
    },
    {
      title: "تعهدات و برنامه‌ریزی مالی",
      items: [
        {
          title: "بدهی‌ها و وام‌ها",
          description: "جدول استهلاک، اقساط ماهانه و تسویه زودهنگام",
          href: "/liabilities",
          icon: ShieldAlert,
          badge: "محاسباتی",
          badgeVariant: "coral",
        },
        {
          title: "اهداف مالی",
          description: "ردیابی تارگت‌ها، زمان‌بندی و پس‌انداز منظم",
          href: "/goals",
          icon: Target,
          badge: "هدفمند",
          badgeVariant: "emerald",
        },
        {
          title: "دفتر کل تراکنش‌ها",
          description: "فهرست کامل واریزها، برداشت‌ها و ثبت رویدادها",
          href: "/transactions",
          icon: ArrowLeftRight,
        },
        {
          title: "جریان نقد ماهانه",
          description: "تراز دریافتی‌ها و مخارج ادواری",
          href: "/cashflow",
          icon: Zap,
        },
      ],
    },
    {
      title: "بازار و هوش مصنوعی",
      items: [
        {
          title: "دیده‌بان زنده بازارها",
          description: "نرخ طلا، سکه، ارز، رمزدارایی‌ها و همگام‌سازی",
          href: "/markets",
          icon: Globe2,
          badge: "زنده",
          badgeVariant: "amber",
        },
        {
          title: "دستیار هوش مصنوعی تئا",
          description: "مشاوره اختصاصی سبد دارایی و بهینه‌سازی ریسک",
          href: "/ai",
          icon: Sparkles,
        },
        {
          title: "دارایی‌های پایه",
          description: "تفکیک فیزیکی، طلا، مسکن، خودرو و نقدینگی",
          href: "/assets",
          icon: Eye,
        },
      ],
    },
    {
      title: "مدیریت حساب و سیستم",
      items: [
        {
          title: "اعلان‌ها و هشدارها",
          description: "هشدارهای نوسان قیمت و پیام‌های سیستمی",
          href: "/notifications",
          icon: Bell,
        },
        {
          title: "تنظیمات سیستم و موتور مالی",
          description: "وضعیت پایگاه داده، ردیس و ثبت اسنپ‌شات",
          href: "/settings",
          icon: Settings,
        },
        {
          title: "حساب کاربری و امنیت",
          description: "اطلاعات هویتی، گذرواژه و نشست‌های فعال",
          href: "/profile",
          icon: User,
        },
      ],
    },
  ];

  const getBadgeStyle = (variant?: string) => {
    switch (variant) {
      case "amber":
        return "bg-[rgba(240,174,85,0.12)] text-[#F0AE55] border-[rgba(240,174,85,0.3)]";
      case "emerald":
        return "bg-[rgba(118,169,140,0.12)] text-[#76A98C] border-[rgba(118,169,140,0.3)]";
      case "coral":
        return "bg-[rgba(199,122,130,0.12)] text-[#C77A82] border-[rgba(199,122,130,0.3)]";
      default:
        return "bg-white/[0.06] text-[#9A9DA5] border-white/[0.1]";
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* User Header Card */}
      <div className="obsidian-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[16px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#F0AE55] text-lg font-bold">
            {user?.full_name ? user.full_name.slice(0, 1) : "ت"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#E8E8E8]">
                {user?.full_name || "کاربر تئا فایننس"}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(240,174,85,0.1)] text-[#F0AE55] border border-[rgba(240,174,85,0.25)] font-medium">
                {user?.role || "کاربر ارشد"}
              </span>
            </div>
            <p className="text-[11px] text-[#696D77] mt-0.5" dir="ltr">
              {user?.email || user?.phone_number || "theia-user"}
            </p>
          </div>
        </div>

        <Link
          href="/profile"
          className="w-9 h-9 rounded-[12px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#9A9DA5] hover:text-[#E8E8E8] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Categorized Menu Sections */}
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-2.5">
          <h3 className="text-xs font-medium text-[#9A9DA5] px-1">
            {section.title}
          </h3>

          <div className="space-y-1.5">
            {section.items.map((item, iIdx) => {
              const Icon = item.icon;

              return (
                <Link
                  key={iIdx}
                  href={item.href}
                  className="obsidian-card p-3 flex items-center justify-between group hover:border-[#F0AE55]/40 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[12px] bg-[#141518] border border-[#282A2F] group-hover:border-[#F0AE55]/40 flex items-center justify-center text-[#F0AE55] transition-colors shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-[#E8E8E8] group-hover:text-[#F0AE55] transition-colors">
                          {item.title}
                        </h4>
                        {item.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-[6px] border font-medium ${getBadgeStyle(
                              item.badgeVariant
                            )}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#696D77] line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronLeft className="w-4 h-4 text-[#696D77] group-hover:text-[#F0AE55] transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* Security badge footer */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141518] border border-[#282A2F] text-[10px] text-[#696D77]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#76A98C]" />
          <span>محیط امن رمزنگاری‌شده تئا فایننس</span>
        </div>
      </div>
    </div>
  );
}
