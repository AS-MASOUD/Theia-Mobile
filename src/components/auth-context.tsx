"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, ProfileUpdateInput, OTPResponse } from "@/types/auth";
import { api, tokenStorage } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { identifier?: string; email?: string; password: string }) => Promise<User>;
  requestOTP: (identifier: string, channel?: string) => Promise<OTPResponse>;
  loginWithOTP: (identifier: string, code: string) => Promise<User>;
  loginAsDemo: () => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: ProfileUpdateInput) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USER: User = {
  id: "demo-user",
  full_name: "تئو رضایی",
  email: "theo@personal-fc.local",
  phone_number: "09123456789",
  role: "user",
  job: "مدیر ارشد سرمایه‌گذاری",
  age: 34,
  bio: "علاقه‌مند به بهینه‌سازی سبد دارایی‌ها، طلا و املاک",
  is_active: true,
  is_verified: true,
  has_completed_financial_onboarding: true,
  has_completed_risk_onboarding: true,
  risk_level: "متعادل رشد",
  risk_score: 82,
  created_at: new Date().toISOString(),
  liquid_assets: 450000000,
  monthly_income: 85000000,
  total_liabilities: 120000000,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshProfile = useCallback(async () => {
    try {
      const token = tokenStorage.get();
      if (!token) {
        // If demo mode was explicitly chosen in this session
        const isDemo = typeof window !== "undefined" && sessionStorage.getItem("pfc_demo_mode") === "1";
        if (isDemo) {
          setUser(DEMO_USER);
        } else {
          setUser(null);
        }
        setIsLoading(false);
        return;
      }
      const profile = await api.getMe();
      setUser(profile);
    } catch {
      tokenStorage.remove();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials: { identifier?: string; email?: string; password: string }): Promise<User> => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pfc_demo_mode");
    }
    const res = await api.login(credentials);
    tokenStorage.set(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const requestOTP = async (identifier: string, channel?: string): Promise<OTPResponse> => {
    return await api.requestOTP(identifier, channel);
  };

  const loginWithOTP = async (identifier: string, code: string): Promise<User> => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pfc_demo_mode");
    }
    const res = await api.verifyOTP(identifier, code);
    tokenStorage.set(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const loginAsDemo = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pfc_demo_mode", "1");
    }
    setUser(DEMO_USER);
    router.push("/");
  };

  const logout = () => {
    tokenStorage.remove();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pfc_demo_mode");
      localStorage.removeItem("pfc_access_token");
    }
    setUser(null);
    router.replace("/login");
  };

  const updateProfile = async (payload: ProfileUpdateInput): Promise<User> => {
    const updated = await api.updateProfile(payload);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        requestOTP,
        loginWithOTP,
        loginAsDemo,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
