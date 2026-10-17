"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  UserCircle,
  Mail,
  Smartphone,
  Briefcase,
  Calendar,
  Lock,
  Sparkles,
  Save,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  LogOut,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";
import { MobileOnboardingModal } from "@/components/mobile/onboarding-modal";

export default function MobileProfilePage() {
  const { user, updateProfile, refreshProfile, logout, isAuthenticated } = useAuth();
  const { formatMoney } = useCurrency();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [job, setJob] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhoneNumber(user.phone_number || "");
      setEmail(user.email || "");
      setAge(user.age !== undefined && user.age !== null ? String(user.age) : "");
      setJob(user.job || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    try {
      await updateProfile({
        full_name: fullName,
        phone_number: phoneNumber || null,
        email: email || null,
        age: age ? parseInt(age, 10) : null,
        job: job || null,
        bio: bio || null,
      });
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ذخیره اطلاعات پروفایل";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("رمز عبور جدید و تکرار آن یکسان نیستند.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در تغییر رمز عبور";
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const roleNameFa = {
    sysmanager: "مدیر ارشد سامانه",
    admin: "مدیر سیستم",
    user: "کاربر فعال",
    viewer: "کاربر ناظر",
  }[user?.role || "user"];

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Arrow */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href="/"
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>

        <span className="text-[11px] font-medium text-[#F0AE55] bg-[rgba(240,174,85,0.09)] px-3 py-0.5 rounded-full border border-[rgba(240,174,85,0.22)]">
          پروفایل کاربری
        </span>

        <button
          onClick={logout}
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#C77A82] hover:text-[#E8E8E8] active:scale-95 transition-colors"
          title="خروج از حساب"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* User Hero Card */}
      <div className="obsidian-card p-5 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          {/* Avatar with subtle ring */}
          <div className="w-13 h-13 rounded-[16px] bg-[#1B1D21] border border-[#282A2F] flex items-center justify-center text-[#F0AE55] font-semibold text-xl shrink-0">
            {fullName.charAt(0) || "U"}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-[#E8E8E8] truncate">
                {fullName || "کاربر تئا"}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[rgba(240,174,85,0.09)] border border-[rgba(240,174,85,0.22)] text-[#F0AE55] text-[10px] font-medium shrink-0">
                {roleNameFa}
              </span>
            </div>
            <p className="text-xs text-[#9A9DA5] mt-0.5 truncate font-number" dir="ltr">
              {email || phoneNumber || "theo@personal-fc.local"}
            </p>
            {job && (
              <p className="text-[11px] text-[#696D77] mt-1 flex items-center gap-1 truncate">
                <Briefcase className="w-3 h-3 text-[#696D77] shrink-0" />
                <span>{job}</span>
              </p>
            )}
          </div>
        </div>

        {/* Financial Badges Overview */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#282A2F]">
          <div className="p-2.5 rounded-[14px] bg-[#1B1D21] border border-[#282A2F] text-center">
            <span className="text-[10px] text-[#696D77] block">سطح ریسک‌پذیری</span>
            <span className="text-xs font-semibold text-[#F0AE55] mt-0.5 block">
              {user?.risk_level || "متعادل"} {user?.risk_score !== null && user?.risk_score !== undefined ? `(${user.risk_score}/100)` : ""}
            </span>
          </div>

          <div
            onClick={() => {
              if (!user?.has_completed_financial_onboarding) {
                setIsOnboardingOpen(true);
              }
            }}
            className={`p-2.5 rounded-[14px] bg-[#1B1D21] border border-[#282A2F] text-center transition-all ${
              !user?.has_completed_financial_onboarding ? "cursor-pointer hover:border-[rgba(240,174,85,0.3)] active:scale-95" : ""
            }`}
          >
            <span className="text-[10px] text-[#696D77] block">وضعیت آنبوردینگ</span>
            <span
              className={`text-xs font-semibold mt-0.5 block flex items-center justify-center gap-1 ${
                user?.has_completed_financial_onboarding ? "text-[#76A98C]" : "text-[#F0AE55]"
              }`}
            >
              {user?.has_completed_financial_onboarding ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تکمیل شده</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>نیاز به تکمیل</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSaveProfile} className="obsidian-card p-4 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#282A2F]">
          <h2 className="text-xs font-medium text-[#9A9DA5] flex items-center gap-1.5">
            <UserCircle className="w-4 h-4 text-[#F0AE55]" />
            <span>مشخصات فردی و شغلی</span>
          </h2>
          {saveSuccess && (
            <span className="text-xs text-[#76A98C] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ذخیره شد!</span>
            </span>
          )}
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-[12px] bg-[#1B1D21] border border-[#C77A82]/30 text-xs text-[#C77A82] font-normal">
            {errorMessage}
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">نام و نام خانوادگی</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            placeholder="نام کامل"
            required
          />
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">شماره موبایل</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
              placeholder="0912..."
              dir="ltr"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">ایمیل</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
              placeholder="user@example.com"
              dir="ltr"
            />
          </div>
        </div>

        {/* Job & Age */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">حرفه / شغل</label>
            <input
              type="text"
              value={job}
              onChange={(e) => setJob(e.target.value)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
              placeholder="عنوان شغلی"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">سن</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-number focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
              placeholder="۳۲"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">بیوگرافی و اهداف</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors resize-none"
            placeholder="درباره اولویت‌های مالی خود بنویسید..."
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 rounded-[14px] bg-[#F0AE55] hover:bg-[#F5BA6E] text-[#0D0E10] font-medium text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-colors disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5 stroke-[2]" />
          <span>{isSaving ? "در حال ثبت تغییرات..." : "ذخیره اطلاعات در سرور"}</span>
        </button>
      </form>

      {/* Security & Password Change Form */}
      <form onSubmit={handleChangePassword} className="obsidian-card p-4 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#282A2F]">
          <h2 className="text-xs font-medium text-[#9A9DA5] flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-[#F0AE55]" />
            <span>امنیت و تغییر رمز عبور</span>
          </h2>
          {passwordSuccess && (
            <span className="text-xs text-[#76A98C] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>رمز تغییر یافت!</span>
            </span>
          )}
        </div>

        {passwordError && (
          <div className="p-2.5 rounded-[12px] bg-[#1B1D21] border border-[#C77A82]/30 text-xs text-[#C77A82] font-normal">
            {passwordError}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9DA5]">رمز عبور فعلی</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">رمز عبور جدید</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
              placeholder="حداقل ۸ کاراکتر"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#9A9DA5]">تکرار رمز جدید</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs focus:border-[rgba(240,174,85,0.35)] focus:outline-none transition-colors"
              placeholder="تکرار رمز"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isChangingPassword}
          className="w-full py-2.5 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] text-xs font-medium hover:border-[#32343A] active:scale-98 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isChangingPassword ? "در حال به‌روزرسانی..." : "تغییر رمز عبور"}
        </button>
      </form>

      {/* Financial Onboarding Modal */}
      <MobileOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
