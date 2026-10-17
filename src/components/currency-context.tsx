"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Currency = "TOMAN" | "USD";

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  formatMoney: (amount: number | string | null | undefined) => string;
  usdToTomanRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("TOMAN");
  const usdToTomanRate = 92000; // Benchmark rate or synced from market API

  useEffect(() => {
    const saved = localStorage.getItem("preferred_currency");
    if (saved === "TOMAN" || saved === "USD") {
      setCurrency(saved);
    }
  }, []);

  const toggleCurrency = () => {
    const next = currency === "TOMAN" ? "USD" : "TOMAN";
    setCurrency(next);
    localStorage.setItem("preferred_currency", next);
  };

  const formatMoney = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined || amount === "") return "۰";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "۰";

    if (currency === "TOMAN") {
      return (
        new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 0,
        }).format(Math.round(num)) + " تومان"
      );
    } else {
      const inUsd = num / usdToTomanRate;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(inUsd);
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        toggleCurrency,
        formatMoney,
        usdToTomanRate,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: "TOMAN" as Currency,
      toggleCurrency: () => {},
      formatMoney: (amount: number | string | null | undefined) =>
        amount ? `${amount} تومان` : "۰ تومان",
      usdToTomanRate: 92000,
    };
  }
  return context;
}
