"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Lock,
  Smartphone,
  KeyRound,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { normalizeDigitsToEnglish, isValidIranPhone } from "@/lib/utils";

export default function MobileLoginPage() {
  const { login, requestOTP, loginWithOTP, loginAsDemo, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Timer countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanId = normalizeDigitsToEnglish(identifier).trim();

    if (!cleanId) {
      setError("لطفاً شماره موبایل یا ایمیل را وارد نمایید.");
      return;
    }
    if (!password) {
      setError("لطفاً رمز عبور را وارد نمایید.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ identifier: cleanId, password });
      router.replace("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "نام کاربری یا رمز عبور اشتباه است.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOTP = async () => {
    setError(null);
    const cleanId = normalizeDigitsToEnglish(identifier).trim();

    if (!cleanId) {
      setError("لطفاً شماره موبایل خود را وارد نمایید.");
      return;
    }
    if (!isValidIranPhone(cleanId)) {
      setError("شماره موبایل باید ۱۱ رقم بوده و با ۰۹ آغاز شود.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestOTP(cleanId, "sms");
      setOtpSent(true);
      setCountdown(res.cooldown_seconds || 120);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ارسال کد ورود";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanId = normalizeDigitsToEnglish(identifier).trim();
    const cleanCode = normalizeDigitsToEnglish(otpCode).trim();

    if (!cleanCode) {
      setError("لطفاً کد تایید دریافتی را وارد کنید.");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithOTP(cleanId, cleanCode);
      router.replace("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "کد تایید نادرست یا منقضی شده است.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-6 px-1 space-y-5">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2.5">
        <div className="w-13 h-13 rounded-[18px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#F0AE55]">
          <Wallet className="w-6 h-6 stroke-[2]" />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-[#E8E8E8] tracking-tight">
            مدیریت مالی تئا
          </h1>
          <p className="text-xs text-[#9A9DA5] mt-0.5">
            ورود به مرکز فرماندهی دارایی‌ها و سرمایه‌گذاری
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="obsidian-card p-5 space-y-4">
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-[14px] bg-[#1B1D21] border border-[#282A2F]">
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-[10px] text-xs font-medium transition-colors ${
              authMode === "password"
                ? "bg-[#F0AE55] text-[#0D0E10]"
                : "text-[#9A9DA5] hover:text-[#E8E8E8]"
            }`}
          >
            رمز عبور
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("otp");
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-[10px] text-xs font-medium transition-colors ${
              authMode === "otp"
                ? "bg-[#F0AE55] text-[#0D0E10]"
                : "text-[#9A9DA5] hover:text-[#E8E8E8]"
            }`}
          >
            کد یکبارمصرف (OTP)
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-[12px] bg-[#1B1D21] border border-[#C77A82]/30 text-xs text-[#C77A82] font-normal flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Form */}
        {authMode === "password" ? (
          <form onSubmit={handlePasswordLogin} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#9A9DA5]">
                شماره موبایل یا ایمیل
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2.5 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
                  placeholder="0912... یا user@example.com"
                  dir="ltr"
                  required
                />
                <Smartphone className="w-4 h-4 text-[#696D77] absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#9A9DA5]">رمز عبور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
                  placeholder="••••••••"
                  dir="ltr"
                  required
                />
                <Lock className="w-4 h-4 text-[#696D77] absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 left-3 text-[#696D77] hover:text-[#E8E8E8] p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-[14px] bg-[#F0AE55] hover:bg-[#F5BA6E] text-[#0D0E10] font-medium text-xs active:scale-98 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 mt-1"
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
              <span>{isSubmitting ? "در حال ورود..." : "ورود به حساب کاربری"}</span>
            </button>
          </form>
        ) : (
          /* OTP Form */
          <form onSubmit={handleOTPLogin} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#9A9DA5]">شماره موبایل</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={otpSent && countdown > 0}
                  className="flex-1 px-3 py-2.5 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors disabled:opacity-50"
                  placeholder="09123456789"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={isSubmitting || countdown > 0}
                  className="px-3.5 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs font-medium text-[#F0AE55] hover:border-[rgba(240,174,85,0.3)] disabled:opacity-50 active:scale-95 transition-colors shrink-0 font-number"
                >
                  {countdown > 0 ? `${countdown}s` : otpSent ? "ارسال مجدد" : "دریافت کد"}
                </button>
              </div>
            </div>

            {otpSent && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#9A9DA5]">
                  کد تایید ۵ رقمی پیامک‌شده
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[12px] bg-[#1B1D21] border border-[rgba(240,174,85,0.25)] text-[#F0AE55] text-center text-lg font-medium tracking-widest font-number focus:border-[#F0AE55] focus:outline-none transition-colors"
                    placeholder="•••••"
                    maxLength={6}
                    dir="ltr"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-[#F0AE55]/60 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
                </div>
              </div>
            )}

            {otpSent && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-[14px] bg-[#F0AE55] hover:bg-[#F5BA6E] text-[#0D0E10] font-medium text-xs active:scale-98 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 mt-1"
              >
                <span>{isSubmitting ? "در حال تایید..." : "تایید کد و ورود"}</span>
              </button>
            )}
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex-1 h-[1px] bg-[#282A2F]" />
          <span className="text-[10px] text-[#696D77]">یا</span>
          <div className="flex-1 h-[1px] bg-[#282A2F]" />
        </div>

        {/* Demo Exploration Button */}
        <button
          type="button"
          onClick={loginAsDemo}
          className="w-full py-2.5 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] hover:border-[#32343A] text-[#9A9DA5] hover:text-[#E8E8E8] text-xs font-medium flex items-center justify-center gap-1.5 active:scale-98 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F0AE55]" />
          <span>ورود سریع در حالت پیش‌نمایش (Demo)</span>
        </button>
      </div>
    </div>
  );
}
