"use client";

import type { AuthResult,User } from "@/lib/auth/types";
import { isMemberPath } from "@/lib/auth/validation";
import React,{ createContext,useCallback,useContext,useEffect,useRef,useState } from "react";
import { authRequest } from "./request";

export type { User } from "@/lib/auth/types";
export interface RegistrationInput { email: string; password: string; confirmPassword: string; fullName: string; organization: string }
interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithCredentials: (email: string, password: string, remember?: boolean) => Promise<AuthResult>;
  sendOtp: (email: string, options?: { isSignUp?: boolean; fullName?: string; organization?: string; password?: string }) => Promise<{ success: boolean; error?: string; isRateLimited?: boolean }>;
  verifyOtp: (email: string, token: string, options?: { password?: string; isSignUp?: boolean; remember?: boolean }) => Promise<AuthResult>;
  register: (input: RegistrationInput) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  isSignInModalOpen: boolean;
  openSignInModal: () => void;
  closeSignInModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const sequence = useRef({ version: 0 });

  const refreshSession = useCallback(async () => {
    const request = ++sequence.current.version;
    const result = await authRequest("session");
    if (request !== sequence.current.version) return;
    setUser(result.success && result.user ? result.user : null);
    setLoading(false);
    if (!result.success && isMemberPath(window.location.pathname)) window.location.replace("/sign-in");
  }, []);

  useEffect(() => {
    const requestState = sequence.current;
    // Remove the previous version's password-bearing, unverified identity cache.
    try { localStorage.removeItem("buildgen_auth_user"); } catch { /* Storage may be disabled. */ }
    void refreshSession();
    const onFocus = () => { void refreshSession(); };
    const onVisibility = () => { if (document.visibilityState === "visible") void refreshSession(); };
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) void refreshSession(); };
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("buildgen-auth") : null;
    if (channel) channel.onmessage = () => { void refreshSession(); };
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      ++requestState.version;
      channel?.close();
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshSession]);

  const loginWithCredentials = async (email: string, password: string, remember = false) => {
    const request = ++sequence.current.version; setLoading(true); setUser(null);
    const result = await authRequest("login", { email, password, remember });
    if (request === sequence.current.version) {
      setUser(result.success && result.user ? result.user : null);
      setLoading(false);
    }
    return result;
  };

  const sendOtp = async (email: string, options?: { isSignUp?: boolean; fullName?: string; organization?: string; password?: string }) => {
    const result: any = await authRequest("send-otp", { email, ...options });
    return { success: result.success === true, error: result.error, isRateLimited: result.isRateLimited === true };
  };

  const verifyOtp = async (email: string, token: string, options?: { password?: string; isSignUp?: boolean; remember?: boolean }) => {
    const request = ++sequence.current.version;
    setLoading(true);
    const result = await authRequest("verify-otp", { email, token, ...options });
    if (request === sequence.current.version) {
      if (result.success && result.user) {
        setUser(result.user);
      }
      setLoading(false);
    }
    return result;
  };

  const register = async (input: RegistrationInput) => {
    ++sequence.current.version; setLoading(true);
    const result = await authRequest("register", input);
    if (result.success) setUser(null);
    setLoading(false); return result;
  };

  const logout = async () => {
    ++sequence.current.version; setLoading(true);
    const result = await authRequest("logout", {});
    setLoading(false);
    if (result.success) {
      setUser(null);
      const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("buildgen-auth") : null;
      channel?.postMessage("signed-out"); channel?.close();
      // Full navigation discards previously cached member route trees.
      window.location.replace("/sign-in");
    }
    return result;
  };

  return <AuthContext.Provider value={{ user, loading, loginWithCredentials, sendOtp, verifyOtp, register, logout,
    isSignInModalOpen, openSignInModal: () => setIsSignInModalOpen(true), closeSignInModal: () => setIsSignInModalOpen(false) }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
