"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";

export type CurrencyType = "TOMAN" | "USD";

interface CurrencyContextType {
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  toggleCurrency: () => void;
  exchangeRate: number; // 1 USD in Toman (latest rate from API)
  usdToTomanRate: number;
  formatMoney: (amount: number | string | null | undefined, baseCurrency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyType>("TOMAN");
  const [exchangeRate, setExchangeRate] = useState<number>(100000);

  useEffect(() => {
    const saved = localStorage.getItem("preferred_currency") as CurrencyType | null;
    if (saved === "TOMAN" || saved === "USD") {
      setCurrencyState(saved);
    }
  }, []);

  // Fetch the latest USD to Toman rate from backend API (synced every 3 minutes)
  useEffect(() => {
    let isSubscribed = true;
    async function fetchLiveDollarRate() {
      try {
        const rates = await api.getMarketRates();
        if (rates && rates.usd_toman_rate && Number(rates.usd_toman_rate) > 0) {
          if (isSubscribed) {
            setExchangeRate(Number(rates.usd_toman_rate));
          }
        }
      } catch {
        // Silently preserve current exchange rate fallback if unauthenticated or offline
      }
    }
    fetchLiveDollarRate();
    const interval = setInterval(fetchLiveDollarRate, 3 * 60 * 1000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  const setCurrency = (next: CurrencyType) => {
    setCurrencyState(next);
    localStorage.setItem("preferred_currency", next);
  };

  const toggleCurrency = () => {
    const next = currency === "TOMAN" ? "USD" : "TOMAN";
    setCurrency(next);
  };

  const formatMoney = (
    amount: number | string | null | undefined,
    baseCurrency = "TOMAN"
  ): string => {
    if (amount === null || amount === undefined || amount === "") {
      return currency === "TOMAN" ? "۰ تومان" : "$0.00";
    }
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return currency === "TOMAN" ? "۰ تومان" : "$0.00";

    const rate = exchangeRate > 0 ? exchangeRate : 100000;

    if (currency === "TOMAN") {
      const valInToman = baseCurrency === "USD" ? num * rate : num;
      return formatCurrency(valInToman, "TOMAN");
    } else {
      const valInUSD = baseCurrency === "TOMAN" ? num / rate : num;
      return formatCurrency(valInUSD, "USD");
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        exchangeRate,
        usdToTomanRate: exchangeRate,
        formatMoney,
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
      currency: "TOMAN" as CurrencyType,
      setCurrency: () => {},
      toggleCurrency: () => {},
      exchangeRate: 100000,
      usdToTomanRate: 100000,
      formatMoney: (amount: number | string | null | undefined, baseCurrency = "TOMAN") =>
        formatCurrency(amount, baseCurrency === "USD" ? "USD" : "TOMAN"),
    };
  }
  return context;
}
