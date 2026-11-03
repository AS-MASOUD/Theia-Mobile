"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  CreditCard,
  Building,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Calculator,
  RefreshCw,
  Loader2,
  Percent,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency-context";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Liability, LiabilityTypeConfig, AmortizationScheduleItem } from "@/types/financial";

export default function MobileLiabilitiesPage() {
  const { formatMoney } = useCurrency();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"loans" | "new" | "calculator">("loans");
  const [payingLiability, setPayingLiability] = useState<Liability | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // New Liability Form State
  const [name, setName] = useState("");
  const [liabilityType, setLiabilityType] = useState("bank_loan");
  const [lender, setLender] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("18.0");
  const [termMonths, setTermMonths] = useState("24");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formError, setFormError] = useState<string | null>(null);

  // Calculator State
  const [calcPrincipal, setCalcPrincipal] = useState("100000000");
  const [calcRate, setCalcRate] = useState("23.0");
  const [calcTerm, setCalcTerm] = useState("36");
  const [schedule, setSchedule] = useState<AmortizationScheduleItem[]>([]);
  const [isCalcLoading, setIsCalcLoading] = useState(false);

  // Queries
  const { data: liabilities, isLoading, refetch, isRefetching } = useQuery<Liability[]>({
    queryKey: ["mobile-liabilities"],
    queryFn: () => api.getLiabilities(),
  });

  const { data: liabilityTypes } = useQuery<LiabilityTypeConfig[]>({
    queryKey: ["mobile-liability-types"],
    queryFn: () => api.getLiabilityTypes(),
  });

  // Calculate totals
  const totals = useMemo(() => {
    if (!liabilities) return { totalBalance: 0, monthlyDebt: 0, count: 0 };
    let bal = 0;
    let monthly = 0;
    for (const l of liabilities) {
      if (parseFloat(l.current_balance) > 0) {
        bal += parseFloat(l.current_balance) || 0;
        monthly += parseFloat(l.monthly_payment) || 0;
      }
    }
    return { totalBalance: bal, monthlyDebt: monthly, count: liabilities.length };
  }, [liabilities]);

  // Create Liability Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      setFormError(null);
      if (!name.trim()) throw new Error("لطفاً نام تسهیلات یا بدهی را وارد کنید.");
      const princ = parseFloat(principal);
      if (isNaN(princ) || princ <= 0) throw new Error("مبلغ اصل وام باید بیشتر از صفر باشد.");

      const payload = {
        name: name.trim(),
        liability_type: liabilityType,
        lender: lender.trim() || undefined,
        original_principal: princ,
        current_balance: princ,
        interest_rate: parseFloat(interestRate) || 0,
        term_months: parseInt(termMonths) || 12,
        monthly_payment: parseFloat(monthlyPayment) || (princ / (parseInt(termMonths) || 12)),
        start_date: startDate,
        currency: "TOMAN",
        is_active: true,
      };

      return api.createLiability(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-liabilities"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      setActiveTab("loans");
      setName("");
      setPrincipal("");
      setMonthlyPayment("");
      setLender("");
      setFormError(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در ثبت وام";
      setFormError(msg);
    },
  });

  // Record Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!payingLiability) return;
      const amt = parseFloat(paymentAmount);
      if (isNaN(amt) || amt <= 0) throw new Error("مبلغ پرداخت معتبر نیست.");
      return api.recordLoanPayment({
        liability_id: payingLiability.id,
        amount: amt,
        payment_date: new Date().toISOString().split("T")[0],
        notes: paymentNotes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-liabilities"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
      setPayingLiability(null);
      setPaymentAmount("");
      setPaymentNotes("");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteLiability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-liabilities"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-overview"] });
    },
  });

  // Calculate Amortization
  const handleCalculate = async () => {
    setIsCalcLoading(true);
    try {
      const p = parseFloat(calcPrincipal) || 0;
      const r = parseFloat(calcRate) || 0;
      const t = parseInt(calcTerm) || 12;
      const res = await api.calculateAmortization(p, r, t);
      setSchedule(res || []);
    } catch {
      // ignore
    } finally {
      setIsCalcLoading(false);
    }
  };

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
          <h1 className="text-sm font-semibold text-[#E8E8E8]">تعهدات و بدهی‌ها</h1>
          <p className="text-[10px] text-[#F0AE55] font-medium uppercase tracking-wider">
            Liabilities & Loans
          </p>
        </div>

        <button
          onClick={() => setActiveTab(activeTab === "new" ? "loans" : "new")}
          className={`w-9 h-9 rounded-[14px] flex items-center justify-center transition-all ${
            activeTab === "new"
              ? "bg-[#F0AE55] text-[#0D0E10]"
              : "btn-illuminated-amber text-xs font-semibold shadow-[0_0_12px_rgba(240,174,85,0.2)]"
          }`}
          title="افزودن وام جدید"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] space-y-1">
          <span className="text-[11px] text-[#9A9DA5] block">مانده کل بدهی‌ها</span>
          <div className="text-sm font-bold text-[#C77A82] font-mono tabular-nums">
            {formatMoney(totals.totalBalance)}
          </div>
          <span className="text-[10px] text-[#696D77] block">
            {totals.count} فقره تسهیلات
          </span>
        </div>

        <div className="p-3.5 rounded-[18px] bg-[#141518] border border-[#282A2F] space-y-1">
          <span className="text-[11px] text-[#9A9DA5] block">تعهد اقساط ماهانه</span>
          <div className="text-sm font-bold text-[#E8E8E8] font-mono tabular-nums">
            {formatMoney(totals.monthlyDebt)}
          </div>
          <span className="text-[10px] text-[#F0AE55] block">
            بار ماهانه بر بودجه
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-[#141518] p-1 rounded-[14px] border border-[#282A2F] text-xs">
        <button
          onClick={() => setActiveTab("loans")}
          className={`flex-1 py-1.5 rounded-[10px] font-medium transition-all ${
            activeTab === "loans"
              ? "bg-[#F0AE55]/15 text-[#F0AE55] font-semibold"
              : "text-[#9A9DA5] hover:text-[#E8E8E8]"
          }`}
        >
          وام‌های فعال ({totals.count})
        </button>
        <button
          onClick={() => setActiveTab("new")}
          className={`flex-1 py-1.5 rounded-[10px] font-medium transition-all ${
            activeTab === "new"
              ? "bg-[#F0AE55]/15 text-[#F0AE55] font-semibold"
              : "text-[#9A9DA5] hover:text-[#E8E8E8]"
          }`}
        >
          ثبت وام جدید
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`flex-1 py-1.5 rounded-[10px] font-medium transition-all ${
            activeTab === "calculator"
              ? "bg-[#F0AE55]/15 text-[#F0AE55] font-semibold"
              : "text-[#9A9DA5] hover:text-[#E8E8E8]"
          }`}
        >
          ماشین‌حساب اقساط
        </button>
      </div>

      {/* Tab 1: Loans List */}
      {activeTab === "loans" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#9A9DA5] px-1">
            <span>فهرست تسهیلات و اعتبارات</span>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1 hover:text-[#F0AE55] transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isRefetching ? "animate-spin text-[#F0AE55]" : ""}`} />
              <span>بروزرسانی</span>
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-[#9A9DA5] bg-[#141518] border border-[#282A2F] rounded-[20px]">
              در حال بارگذاری تسهیلات...
            </div>
          ) : !liabilities || liabilities.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#9A9DA5] bg-[#141518] border border-[#282A2F] rounded-[20px] space-y-2">
              <CreditCard className="w-8 h-8 mx-auto text-[#696D77] stroke-[1.5]" />
              <p>هیچ وام یا بدهی فعالی ثبت نشده است.</p>
            </div>
          ) : (
            liabilities.map((loan) => {
              const orig = parseFloat(loan.original_principal) || 1;
              const cur = parseFloat(loan.current_balance) || 0;
              const monthly = parseFloat(loan.monthly_payment) || 0;
              const paidPct = Math.max(0, Math.min(100, Math.round(((orig - cur) / orig) * 100)));

              return (
                <div
                  key={loan.id}
                  className="p-4 rounded-[20px] bg-[#141518] border border-[#282A2F] space-y-3 hover:border-[#32343A] transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-[12px] bg-[rgba(240,174,85,0.08)] border border-[rgba(240,174,85,0.2)] text-[#F0AE55] flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-[#E8E8E8]">
                          {loan.name}
                        </h3>
                        <div className="text-[11px] text-[#9A9DA5]">
                          {loan.lender || "بانک / موسسه مالی"} • بهره {loan.interest_rate_percent}%
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <div className="text-xs font-bold text-[#C77A82] font-mono tabular-nums">
                        {formatMoney(cur)}
                      </div>
                      <div className="text-[10px] text-[#696D77]">
                        از {formatMoney(orig)}
                      </div>
                    </div>
                  </div>

                  {/* Repayment Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#9A9DA5] font-mono">
                      <span>پیشرفت تسویه</span>
                      <span>{paidPct}% پرداخت شده</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1B1D21] rounded-full overflow-hidden border border-[#282A2F]/60">
                      <div
                        className="h-full bg-gradient-to-l from-[#76A98C] to-[#F0AE55] transition-all duration-300"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Monthly and Actions */}
                  <div className="pt-2 border-t border-[#282A2F]/70 flex items-center justify-between">
                    <div className="text-[11px] text-[#9A9DA5]">
                      <span>قسط ماهانه: </span>
                      <span className="font-semibold text-[#E8E8E8] font-mono">
                        {formatMoney(monthly)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPayingLiability(loan);
                          setPaymentAmount(String(monthly));
                        }}
                        className="px-2.5 py-1 rounded-[10px] bg-[#76A98C]/15 text-[#76A98C] border border-[#76A98C]/30 text-[11px] font-medium active:scale-95 transition-all"
                      >
                        ثبت پرداخت قسط
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("آیا از حذف این وام اطمینان دارید؟")) {
                            deleteMutation.mutate(loan.id);
                          }
                        }}
                        className="w-7 h-7 rounded-[8px] bg-white/[0.03] text-[#696D77] hover:text-[#C77A82] flex items-center justify-center transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Add Liability Form */}
      {activeTab === "new" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="p-4 rounded-[22px] bg-[#141518] border border-[#282A2F] space-y-3.5"
        >
          <h2 className="text-xs font-semibold text-[#E8E8E8]">ثبت وام یا تعهد مالی جدید</h2>

          {formError && (
            <div className="p-3 rounded-[12px] bg-[#C77A82]/10 border border-[#C77A82]/30 text-xs text-[#C77A82]">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] text-[#9A9DA5]">عنوان تسهیلات یا بدهی</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: وام مسکن ملی، خرید اقساطی لپ‌تاپ"
              className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] focus:outline-none focus:border-[#F0AE55]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">نوع تعهد</label>
              <select
                value={liabilityType}
                onChange={(e) => setLiabilityType(e.target.value)}
                className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] focus:outline-none focus:border-[#F0AE55]"
              >
                <option value="bank_loan">وام بانکی</option>
                <option value="installment">خرید اقساطی</option>
                <option value="friend_loan">قرض از دوستان/خانواده</option>
                <option value="mortgage">رهن و اجاره</option>
                <option value="other">سایر تعهدات</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">نام وام‌دهنده / موسسه</label>
              <input
                type="text"
                value={lender}
                onChange={(e) => setLender(e.target.value)}
                placeholder="بانک ملت، دیجی‌پی و..."
                className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] focus:outline-none focus:border-[#F0AE55]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">اصل مبلغ (تومان)</label>
              <input
                type="number"
                required
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="100000000"
                className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] font-mono focus:outline-none focus:border-[#F0AE55]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">نرخ سود سالانه (٪)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] font-mono focus:outline-none focus:border-[#F0AE55]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">مدت بازپرداخت (ماه)</label>
              <input
                type="number"
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] font-mono focus:outline-none focus:border-[#F0AE55]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">مبلغ هر قسط (تومان)</label>
              <input
                type="number"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                placeholder="محاسبه خودکار در صورت خالی"
                className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] font-mono focus:outline-none focus:border-[#F0AE55]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-2.5 rounded-[12px] btn-illuminated-amber text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-98 transition-all mt-2 cursor-pointer"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>ثبت و اضافه به بدهی‌ها</span>
            )}
          </button>
        </form>
      )}

      {/* Tab 3: Loan Amortization Calculator */}
      {activeTab === "calculator" && (
        <div className="space-y-4">
          <div className="p-4 rounded-[22px] bg-[#141518] border border-[#282A2F] space-y-3">
            <h2 className="text-xs font-semibold text-[#E8E8E8] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#F0AE55]" />
              <span>محاسبه‌گر حرفه‌ای اقساط وام بانکی</span>
            </h2>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-[#9A9DA5]">مبلغ وام</label>
                <input
                  type="number"
                  value={calcPrincipal}
                  onChange={(e) => setCalcPrincipal(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-[#9A9DA5]">بهره (٪)</label>
                <input
                  type="number"
                  value={calcRate}
                  onChange={(e) => setCalcRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-[#9A9DA5]">مدت (ماه)</label>
                <input
                  type="number"
                  value={calcTerm}
                  onChange={(e) => setCalcTerm(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={isCalcLoading}
              className="w-full py-2 rounded-[10px] btn-illuminated-amber text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              {isCalcLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "محاسبه جدول استهلاک"}
            </button>
          </div>

          {schedule.length > 0 && (
            <div className="p-4 rounded-[22px] bg-[#141518] border border-[#282A2F] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9A9DA5]">مبلغ هر قسط:</span>
                <span className="font-bold text-[#E8E8E8] font-mono">
                  {formatMoney(schedule[0]?.payment || 0)}
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1.5 text-[11px] font-mono">
                {schedule.slice(0, 12).map((row) => (
                  <div
                    key={row.month}
                    className="p-2 rounded-[10px] bg-[#1B1D21] border border-[#282A2F]/60 flex items-center justify-between"
                  >
                    <span className="text-[#9A9DA5]">ماه {row.month}</span>
                    <span className="text-[#E8E8E8]">{formatMoney(row.payment)}</span>
                    <span className="text-[#C77A82]">سود: {formatMoney(row.interest)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Record Payment Sheet */}
      {payingLiability && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center p-3">
          <div className="w-full max-w-sm rounded-[24px] bg-[#141518] border border-[#282A2F] p-5 space-y-3.5 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b border-[#282A2F] pb-2">
              <h3 className="text-xs font-semibold text-[#E8E8E8]">
                ثبت قسط پرداختی: {payingLiability.name}
              </h3>
              <button
                onClick={() => setPayingLiability(null)}
                className="text-[#9A9DA5] hover:text-[#E8E8E8] text-xs"
              >
                انصراف
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">مبلغ پرداختی (تومان)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#9A9DA5]">یادداشت یا کد رهگیری (اختیاری)</label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="شماره پیگیری پرداخت بانکی..."
                className="w-full px-3 py-2 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-xs text-[#E8E8E8]"
              />
            </div>

            <button
              onClick={() => paymentMutation.mutate()}
              disabled={paymentMutation.isPending}
              className="w-full py-2.5 rounded-[12px] btn-illuminated-amber text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              {paymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "تایید و کسر از بدهی"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
