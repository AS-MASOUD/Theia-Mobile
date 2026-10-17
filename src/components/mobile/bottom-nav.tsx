"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, SlidersHorizontal, Flame, Eye, Zap } from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/", icon: Home, label: "خانه" },
  { href: "/portfolio", icon: SlidersHorizontal, label: "تخصیص" },
  { href: "/health", icon: Flame, label: "اقلیم مالی" },
  { href: "/assets", icon: Eye, label: "دارایی‌ها" },
  { href: "/cashflow", icon: Zap, label: "جریان نقد" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide on login screen
  if (pathname === "/login") {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-4 pt-2">
      <nav
        aria-label="Mobile Navigation"
        className="pointer-events-auto max-w-[364px] mx-auto px-3 py-1 bg-[#141518]/95 backdrop-blur-xl border border-[rgba(255,255,255,0.065)] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)] flex items-center justify-around relative"
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 active:scale-95 group"
            >
              {/* Soft Diffused Amber Ambient Glow behind Selected Icon (Reference Navigation) */}
              {isActive && (
                <div
                  className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[radial-gradient(circle,rgba(240,174,85,0.32)_0%,rgba(240,174,85,0.08)_50%,transparent_75%)] pointer-events-none z-0"
                />
              )}

              <Icon
                className={`w-5 h-5 transition-all duration-200 relative z-10 ${
                  isActive
                    ? "stroke-[2.2] text-[#F0AE55] drop-shadow-[0_0_6px_rgba(240,174,85,0.4)]"
                    : "stroke-[1.65] text-[#696D77] group-hover:text-[#9A9DA5]"
                }`}
              />
              <span className="sr-only">{item.label}</span>

              {/* Tiny Illuminated Amber Dot below Selected Icon */}
              {isActive && (
                <span className="w-1.5 h-1.5 bg-[#F0AE55] rounded-full mt-1 relative z-10 shadow-[0_0_6px_rgba(240,174,85,0.85)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
