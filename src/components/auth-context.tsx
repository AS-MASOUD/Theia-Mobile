"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  ProfileUpdateInput,
  OTPResponse,
  RegisterRequestOTPInput,
  RegisterVerifyOTPInput,
  SystemRole,
} from "@/types/auth";
import { api, tokenStorage } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSysManager: boolean;
  isAdmin: boolean;
  isViewer: boolean;
  login: (credentials: { identifier?: string; email?: string; password: string }) => Promise<User>;
  requestOTP: (identifier: string, channel?: string) => Promise<OTPResponse>;
  loginWithOTP: (identifier: string, code: string) => Promise<User>;
  register: (payload: { email?: string; phone_number?: string; password?: string; full_name: string; code?: string }) => Promise<User>;
  requestRegisterOTP: (payload: RegisterRequestOTPInput) => Promise<OTPResponse>;
  registerWithOTP: (payload: RegisterVerifyOTPInput) => Promise<User>;
  loginAsDemo: () => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: ProfileUpdateInput) => Promise<User>;
  hasRole: (...roles: SystemRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshProfile = useCallback(async () => {
    const savedToken = tokenStorage.get();
    if (!savedToken) {
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    setToken(savedToken);
    try {
      const profile = await api.getMe();
      setUser(profile);
    } catch {
      tokenStorage.remove();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(
    async (credentials: { identifier?: string; email?: string; password: string }): Promise<User> => {
      const res = await api.login(credentials);
      tokenStorage.set(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const requestOTP = useCallback(async (identifier: string, channel?: string): Promise<OTPResponse> => {
    return await api.requestOTP(identifier, channel);
  }, []);

  const loginWithOTP = useCallback(
    async (identifier: string, code: string): Promise<User> => {
      const res = await api.verifyOTP(identifier, code);
      tokenStorage.set(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const register = useCallback(
    async (payload: { email?: string; phone_number?: string; password?: string; full_name: string; code?: string }): Promise<User> => {
      const res = await api.register(payload);
      tokenStorage.set(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const requestRegisterOTP = useCallback(
    async (payload: RegisterRequestOTPInput): Promise<OTPResponse> => {
      return await api.requestRegisterOTP(payload);
    },
    []
  );

  const registerWithOTP = useCallback(
    async (payload: RegisterVerifyOTPInput): Promise<User> => {
      const res = await api.verifyRegisterOTP(payload);
      tokenStorage.set(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const loginAsDemo = useCallback(async (): Promise<User> => {
    // Authenticate with the real demo admin account on backend for full parity & live data
    try {
      const res = await api.login({
        identifier: "admin@personal-fc.local",
        password: "AdminPassword123!",
      });
      tokenStorage.set(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      router.push("/");
      return res.user;
    } catch {
      // Fallback try user account
      const res = await api.login({
        identifier: "user@personal-fc.local",
        password: "AdminPassword123!",
      });
      tokenStorage.set(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      router.push("/");
      return res.user;
    }
  }, [router]);

  const logout = useCallback(() => {
    tokenStorage.remove();
    setToken(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  const updateProfile = useCallback(
    async (payload: ProfileUpdateInput): Promise<User> => {
      const updated = await api.updateProfile(payload);
      setUser(updated);
      return updated;
    },
    []
  );

  const hasRole = useCallback(
    (...roles: SystemRole[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      isSysManager: user?.role === "sysmanager",
      isAdmin: user?.role === "admin" || user?.role === "sysmanager",
      isViewer: user?.role === "viewer",
      login,
      requestOTP,
      loginWithOTP,
      register,
      requestRegisterOTP,
      registerWithOTP,
      loginAsDemo,
      logout,
      refreshProfile,
      updateProfile,
      hasRole,
    }),
    [
      user,
      token,
      isLoading,
      login,
      requestOTP,
      loginWithOTP,
      register,
      requestRegisterOTP,
      registerWithOTP,
      loginAsDemo,
      logout,
      refreshProfile,
      updateProfile,
      hasRole,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
