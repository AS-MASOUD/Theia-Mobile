"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Smartphone,
  KeyRound,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  Mail,
} from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { normalizeDigitsToEnglish, isValidIranPhone } from "@/lib/utils";
import { GlassAuthCard, MobileAuthTransitionState } from "@/components/mobile/glass-auth-card";

export default function MobileLoginPage() {
  const { login, requestOTP, loginWithOTP, loginAsDemo, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Transition state
  const [transitionState, setTransitionState] = useState<MobileAuthTransitionState>("idle");
  const [statusText, setStatusText] = useState("در حال ورود به برنامه...");
  const [error, setError] = useState<string | null>(null);

  // If already authenticated and not transitioning, redirect to home
  useEffect(() => {
    if (!isLoading && isAuthenticated && transitionState === "idle") {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, transitionState, router]);

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

    setTransitionState("authenticating");
    setStatusText("در حال اعتبارسنجی رمز عبور...");

    try {
      await login({ identifier: cleanId, password });

      setTransitionState("success");
      setStatusText("ورود با موفقیت انجام شد! در حال انتقال...");

      setTimeout(() => {
        setTransitionState("exiting");
        setTimeout(() => {
          router.replace("/");
        }, 220);
      }, 950);
    } catch (err: unknown) {
      setTransitionState("error");
      const msg = err instanceof Error ? err.message : "نام کاربری یا رمز عبور اشتباه است.";
      setError(msg);
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

    try {
      const res = await requestOTP(cleanId, "sms");
      setOtpSent(true);
      setCountdown(res.cooldown_seconds || 120);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ارسال کد ورود";
      setError(msg);
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

    setTransitionState("authenticating");
    setStatusText("در حال تایید کد یکبار مصرف...");

    try {
      await loginWithOTP(cleanId, cleanCode);

      setTransitionState("success");
      setStatusText("ورود با موفقیت انجام شد! در حال انتقال...");

      setTimeout(() => {
        setTransitionState("exiting");
        setTimeout(() => {
          router.replace("/");
        }, 220);
      }, 950);
    } catch (err: unknown) {
      setTransitionState("error");
      const msg = err instanceof Error ? err.message : "کد تایید نادرست یا منقضی شده است.";
      setError(msg);
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <GlassAuthCard
      transitionState={transitionState}
      statusText={statusText}
      onCancelSubmitting={() => setTransitionState("idle")}
    >
      {/* Brand Header */}
      <div className="text-center mb-3">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#F4F4F5] tracking-tight">
          خوش <span className="text-[#F0AE55]">آمدید</span>
        </h1>
        <p className="mt-0.5 text-xs text-[#A1A1AA]">
          برای دسترسی به حساب خود، اطلاعات‌تان را وارد کنید
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center p-0.5 rounded-xl bg-[#15161A] border border-white/5 mb-2.5">
        <button
          type="button"
          onClick={() => {
            setAuthMode("password");
            setError(null);
          }}
          className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            authMode === "password"
              ? "bg-[#22242B] text-[#F0AE55] font-bold shadow-sm"
              : "text-[#8E929E]"
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
          className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            authMode === "otp"
              ? "bg-[#22242B] text-[#F0AE55] font-bold shadow-sm"
              : "text-[#8E929E]"
          }`}
        >
          کد یکبار مصرف
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-2.5 p-2 rounded-xl bg-[#C77A82]/15 border border-[#C77A82]/30 text-[#E08A92] text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PASSWORD LOGIN FORM */}
      {authMode === "password" && (
        <form onSubmit={handlePasswordLogin} className="space-y-2.5">
          <div className="space-y-1 text-right">
            <label className="block text-xs font-medium text-[#D1D5DB]">
              آدرس ایمیل یا شماره موبایل
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(normalizeDigitsToEnglish(e.target.value))}
                placeholder="name@domain.com"
                dir="ltr"
                className="auth-input h-[44px] pr-9 pl-3 text-sm text-left font-mono"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E929E]" />
            </div>
          </div>

          <div className="space-y-1 text-right">
            <label className="block text-xs font-medium text-[#D1D5DB]">
              رمز عبور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                dir="ltr"
                className="auth-input h-[44px] pr-9 pl-9 text-sm text-left"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E929E]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8E929E] hover:text-[#F4F4F5] p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Symmetrical Row: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-0.5 select-none">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer ${
                  rememberMe
                    ? "bg-[#F0AE55] text-[#0D0E10] shadow-sm shadow-[#F0AE55]/30"
                    : "bg-[#18191E] border border-white/15 text-transparent"
                }`}
              >
                <Check className="h-3 w-3 stroke-[3]" />
              </button>
              <span
                onClick={() => setRememberMe(!rememberMe)}
                className="text-xs text-[#A1A1AA] hover:text-[#E4E4E7] cursor-pointer"
              >
                مرا به خاطر بسپار
              </span>
            </div>

            <Link
              href="/forgot-password"
              className="text-[11px] text-[#A1A1AA] hover:text-[#F0AE55] transition-colors"
            >
              فراموشی رمز عبور؟
            </Link>
          </div>

          <button
            type="submit"
            className="w-full h-[44px] mt-1 rounded-2xl bg-gradient-to-r from-[#F3BE76] via-[#F0AE55] to-[#E89E3E] hover:brightness-105 active:scale-[0.99] text-[#0D0E10] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_18px_rgba(240,174,85,0.25)]"
          >
            <span>ورود به حساب</span>
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      )}

      {/* OTP LOGIN FORM */}
      {authMode === "otp" && (
        <div className="space-y-2.5">
          <div className="space-y-1 text-right">
            <label className="block text-xs font-medium text-[#D1D5DB]">
              شماره موبایل
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  disabled={otpSent && countdown > 0}
                  value={identifier}
                  onChange={(e) => setIdentifier(normalizeDigitsToEnglish(e.target.value))}
                  placeholder="09121111111"
                  dir="ltr"
                  className="auth-input h-[44px] pr-9 pl-3 text-sm text-left font-mono disabled:opacity-60"
                />
                <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E929E]" />
              </div>
              {!otpSent && (
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={!identifier.trim()}
                  className="h-[44px] px-3.5 rounded-2xl bg-[#F0AE55] text-[#0D0E10] text-xs font-bold transition-all disabled:opacity-40 shrink-0 cursor-pointer"
                >
                  ارسال کد
                </button>
              )}
            </div>
          </div>

          {otpSent && (
            <form onSubmit={handleOTPLogin} className="space-y-2.5 pt-0.5">
              <div className="space-y-1 text-right">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[#D1D5DB]">
                    کد تایید ۵ رقمی
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                    }}
                    className="text-[11px] text-[#F0AE55] hover:underline cursor-pointer"
                  >
                    تغییر شماره
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={otpCode}
                    onChange={(e) => {
                      const clean = normalizeDigitsToEnglish(e.target.value).replace(/\D/g, "");
                      if (clean.length <= 5) setOtpCode(clean);
                    }}
                    placeholder="•••••"
                    dir="ltr"
                    autoFocus
                    className="auth-input h-[44px] pr-9 pl-3 text-base text-[#F0AE55] text-center tracking-[0.4em] font-semibold"
                  />
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E929E]" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                {countdown > 0 ? (
                  <span>ارسال مجدد پس از: {formatCountdown(countdown)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    className="flex items-center gap-1 text-[#F0AE55] hover:underline font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ارسال مجدد</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={otpCode.length < 5}
                className="w-full h-[44px] rounded-2xl bg-gradient-to-r from-[#F3BE76] via-[#F0AE55] to-[#E89E3E] text-[#0D0E10] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_18px_rgba(240,174,85,0.25)] disabled:opacity-40"
              >
                <span>ورود به حساب</span>
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* Demo Fast Login */}
      <div className="mt-3 pt-2.5 border-t border-white/10">
        <button
          type="button"
          onClick={async () => {
            setTransitionState("authenticating");
            setStatusText("در حال راه‌اندازی نشست دمو آزمایشی...");
            try {
              await loginAsDemo();
              setTransitionState("success");
              setStatusText("ورود با موفقیت انجام شد! در حال انتقال...");
              setTimeout(() => {
                setTransitionState("exiting");
                setTimeout(() => {
                  router.replace("/");
                }, 220);
              }, 950);
            } catch {
              setTransitionState("error");
              setError("خطا در ورود به حساب دمو");
            }
          }}
          className="w-full py-2 rounded-xl bg-[#15161A] hover:bg-[#1C1E23] border border-white/10 flex items-center justify-center gap-2 text-xs font-medium text-[#E4E4E7] transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F0AE55]" />
          <span>ورود سریع آزمایشی (نسخه دمو)</span>
        </button>
      </div>

      {/* Footer Switch */}
      <div className="mt-3 text-center text-xs text-[#A1A1AA]">
        <span>هنوز حساب کاربری ندارید؟ </span>
        <Link
          href="/register"
          className="text-[#F0AE55] font-bold hover:underline"
        >
          ثبت‌نام
        </Link>
      </div>
    </GlassAuthCard>
  );
}
