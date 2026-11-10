"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  organization: string;
  avatar: string;
  quotaUsed: number;
  quotaTotal: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    type?: "mustafa" | "architect" | "engineer" | "custom",
    customEmail?: string,
    customName?: string,
    customPassword?: string
  ) => Promise<boolean>;
  loginWithCredentials: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  validateCredentials: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  sendOtp: (
    email: string,
    options?: {
      isSignUp?: boolean;
      fullName?: string;
      organization?: string;
      password?: string;
    }
  ) => Promise<{ success: boolean; error?: string; isRateLimited?: boolean }>;
  verifyOtp: (
    email: string,
    token: string,
    type?: "email" | "signup",
    pendingUserData?: Partial<User>
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  registerWithCredentials: (
    email: string,
    password: string,
    fullName: string,
    organization: string
  ) => Promise<{ success: boolean; error?: string; user?: User; isRateLimited?: boolean }>;
  saveUserSession: (newUser: User) => void;
  logout: () => Promise<void>;
  isSignInModalOpen: boolean;
  openSignInModal: () => void;
  closeSignInModal: () => void;
}

export const DEFAULT_MUSTAFA_USER: User = {
  id: "d3c8a709-504e-458b-a260-bca201c57ec2",
  name: "Mustafa",
  email: "bscs2312208@szabist.pk",
  password: "admin",
  role: "Lead Architect",
  organization: "CYAN/DRAFT ARCHITECTURAL STUDIO",
  avatar: "MA",
  quotaUsed: 3,
  quotaTotal: 50,
};

export const DEFAULT_ARCHITECT_USER: User = {
  id: "usr_arch_01",
  name: "Alex Vance",
  email: "alex.vance@cyan-draft.studio",
  password: "admin",
  role: "Lead Residential Architect",
  organization: "CYAN/DRAFT ARCHITECTURAL STUDIO",
  avatar: "AV",
  quotaUsed: 4,
  quotaTotal: 25,
};

export const DEFAULT_ENGINEER_USER: User = {
  id: "usr_eng_02",
  name: "Sarah Lin, PE",
  email: "sarah.lin@strata-eng.com",
  password: "admin",
  role: "Senior Structural & BIM Engineer",
  organization: "STRATA ENGINEERING GROUP",
  avatar: "SL",
  quotaUsed: 7,
  quotaTotal: 50,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => false,
  loginWithCredentials: async () => ({ success: false }),
  validateCredentials: async () => ({ success: false }),
  sendOtp: async () => ({ success: false }),
  verifyOtp: async () => ({ success: false }),
  registerWithCredentials: async () => ({ success: false }),
  saveUserSession: () => {},
  logout: async () => {},
  isSignInModalOpen: false,
  openSignInModal: () => {},
  closeSignInModal: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  // Initialize user from Supabase session or localStorage
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // 1. Try local storage cache first for instant hydration
      try {
        const stored = localStorage.getItem("buildgen_auth_user");
        if (stored && isMounted) {
          setUser(JSON.parse(stored));
        }
      } catch {
        // ignore
      }

      // 2. Sync with Supabase session if configured
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id && isMounted) {
            // Query live profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, name, display_name, email, password, role, organization, sheets_quota, avatar_url")
              .eq("id", session.user.id)
              .maybeSingle();

            if (profile && isMounted) {
              const liveUser: User = {
                id: profile.id,
                name: profile.name || profile.display_name || session.user.email?.split("@")[0] || "Mustafa",
                email: profile.email || session.user.email || "bscs2312208@szabist.pk",
                password: profile.password || "admin",
                role: profile.role || "Lead Architect",
                organization: profile.organization || "CYAN/DRAFT ARCHITECTURAL STUDIO",
                avatar: profile.avatar_url || (profile.name || "MA").substring(0, 2).toUpperCase(),
                quotaUsed: 3,
                quotaTotal: profile.sheets_quota || 50,
              };
              setUser(liveUser);
              try {
                localStorage.setItem("buildgen_auth_user", JSON.stringify(liveUser));
              } catch {
                // ignore
              }
            }
          }
        } catch (err) {
          console.warn("Supabase auth session sync notice:", err);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveUserSession = (newUser: User) => {
    setUser(newUser);
    try {
      localStorage.setItem("buildgen_auth_user", JSON.stringify(newUser));
    } catch {
      // ignore
    }
    setIsSignInModalOpen(false);
  };

  /**
   * Validate studio credentials against Supabase profiles or hardcoded demo seats
   * (does NOT set active session until OTP verification is completed)
   */
  const validateCredentials = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      // 1. Direct match for Mustafa canonical credentials
      if (cleanEmail === "bscs2312208@szabist.pk" && cleanPass === "admin") {
        let userObj: User = DEFAULT_MUSTAFA_USER;
        if (isSupabaseConfigured) {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("email", "bscs2312208@szabist.pk")
              .maybeSingle();

            if (profile) {
              userObj = {
                id: profile.id,
                name: profile.name || "Mustafa",
                email: profile.email || "bscs2312208@szabist.pk",
                password: profile.password || "admin",
                role: profile.role || "Lead Architect",
                organization: profile.organization || "CYAN/DRAFT ARCHITECTURAL STUDIO",
                avatar: profile.avatar_url || "MA",
                quotaUsed: 3,
                quotaTotal: profile.sheets_quota || 50,
              };
            }
          } catch (e) {
            console.warn("Supabase profile check:", e);
          }
        }
        setLoading(false);
        return { success: true, user: userObj };
      }

      // 2. Query public.profiles for registered studio user
      if (isSupabaseConfigured) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .ilike("email", cleanEmail)
          .maybeSingle();

        if (profile && profile.password === cleanPass) {
          const userObj: User = {
            id: profile.id,
            name: profile.name || profile.display_name || cleanEmail.split("@")[0],
            email: profile.email || cleanEmail,
            password: profile.password,
            role: profile.role || profile.professional_label || "Lead Architect",
            organization: profile.organization || "CYAN/DRAFT ARCHITECTURAL STUDIO",
            avatar: profile.avatar_url || (profile.name || "AR").substring(0, 2).toUpperCase(),
            quotaUsed: 2,
            quotaTotal: profile.sheets_quota || 25,
          };
          setLoading(false);
          return { success: true, user: userObj };
        }

        // Try Supabase Auth password check
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (!authErr && authData?.user) {
          const userObj: User = {
            id: authData.user.id,
            name: authData.user.user_metadata?.name || authData.user.user_metadata?.full_name || cleanEmail.split("@")[0],
            email: authData.user.email || cleanEmail,
            password: cleanPass,
            role: authData.user.user_metadata?.role || "Lead Architect",
            organization: "CYAN/DRAFT ARCHITECTURAL STUDIO",
            avatar: (authData.user.user_metadata?.name || "AR").substring(0, 2).toUpperCase(),
            quotaUsed: 1,
            quotaTotal: 50,
          };
          setLoading(false);
          return { success: true, user: userObj };
        }
      }

      // 3. Fallback demo users check
      if (cleanEmail === DEFAULT_ARCHITECT_USER.email && cleanPass === "admin") {
        setLoading(false);
        return { success: true, user: DEFAULT_ARCHITECT_USER };
      }
      if (cleanEmail === DEFAULT_ENGINEER_USER.email && cleanPass === "admin") {
        setLoading(false);
        return { success: true, user: DEFAULT_ENGINEER_USER };
      }

      setLoading(false);
      return {
        success: false,
        error: "Invalid studio credentials. Please check your email and password.",
      };
    } catch (err: any) {
      setLoading(false);
      return {
        success: false,
        error: err?.message || "An authentication error occurred. Please verify your connection.",
      };
    }
  };

  /**
   * Dispatch an OTP to the user's email using Supabase Auth
   */
  const sendOtp = async (
    email: string,
    options?: {
      isSignUp?: boolean;
      fullName?: string;
      organization?: string;
      password?: string;
    }
  ): Promise<{ success: boolean; error?: string; isRateLimited?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: "Please enter a valid work email." };
    }

    if (!isSupabaseConfigured) {
      return { success: true, isRateLimited: false };
    }

    try {
      if (options?.isSignUp) {
        // Sign Up with Supabase Auth
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: options.password || "StudioAuthPass2026!",
          options: {
            data: {
              full_name: options.fullName || cleanEmail.split("@")[0],
              organization: options.organization || "CYAN/DRAFT ARCHITECTURAL STUDIO",
              role: "Residential Architect",
            },
          },
        });

        if (error) {
          const msg = error.message?.toLowerCase() || "";
          if (msg.includes("rate limit") || error.code === "over_email_send_rate_limit") {
            return {
              success: true,
              isRateLimited: true,
              error: "Supabase email rate limit safeguard active. Use master code 123456 to verify.",
            };
          }
          if (msg.includes("already registered")) {
            // Already registered - try signInWithOtp instead
            const otpRes = await supabase.auth.signInWithOtp({
              email: cleanEmail,
              options: { shouldCreateUser: false },
            });
            if (otpRes.error) {
              const oMsg = otpRes.error.message?.toLowerCase() || "";
              if (oMsg.includes("rate limit") || otpRes.error.code === "over_email_send_rate_limit") {
                return { success: true, isRateLimited: true };
              }
              return { success: false, error: otpRes.error.message };
            }
            return { success: true };
          }
          return { success: false, error: error.message };
        }
        return { success: true };
      } else {
        // Sign In OTP with Supabase Auth
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: { shouldCreateUser: false },
        });

        if (error) {
          const msg = error.message?.toLowerCase() || "";
          if (msg.includes("rate limit") || error.code === "over_email_send_rate_limit") {
            return {
              success: true,
              isRateLimited: true,
              error: "Supabase email rate limit safeguard active. Use master code 123456 to verify.",
            };
          }
          if (msg.includes("signups not allowed") || msg.includes("user not found")) {
            const createRes = await supabase.auth.signInWithOtp({
              email: cleanEmail,
              options: { shouldCreateUser: true },
            });
            if (createRes.error) {
              const cMsg = createRes.error.message?.toLowerCase() || "";
              if (cMsg.includes("rate limit") || createRes.error.code === "over_email_send_rate_limit") {
                return { success: true, isRateLimited: true };
              }
              return { success: false, error: createRes.error.message };
            }
            return { success: true };
          }
          return { success: false, error: error.message };
        }
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to dispatch Supabase OTP." };
    }
  };

  /**
   * Verify an OTP token using Supabase Auth, establishing live session on success
   */
  const verifyOtp = async (
    email: string,
    token: string,
    type: "email" | "signup" = "email",
    pendingUserData?: Partial<User>
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    // 1. Developer / Studio Master Bypass Token (123456 or 000000)
    // Essential for development & when Supabase free tier email rate limits are triggered
    if (cleanToken === "123456" || cleanToken === "000000") {
      let finalUser: User = {
        id: pendingUserData?.id || `usr_${Date.now()}`,
        name: pendingUserData?.name || (cleanEmail === "bscs2312208@szabist.pk" ? "Mustafa" : cleanEmail.split("@")[0]),
        email: cleanEmail,
        password: pendingUserData?.password || "admin",
        role: pendingUserData?.role || (cleanEmail === "bscs2312208@szabist.pk" ? "Lead Architect" : "Residential Architect"),
        organization: pendingUserData?.organization || "CYAN/DRAFT ARCHITECTURAL STUDIO",
        avatar: (pendingUserData?.name || (cleanEmail === "bscs2312208@szabist.pk" ? "MA" : "AR")).substring(0, 2).toUpperCase(),
        quotaUsed: 1,
        quotaTotal: 50,
      };

      if (cleanEmail === "bscs2312208@szabist.pk") {
        finalUser = { ...DEFAULT_MUSTAFA_USER, ...pendingUserData };
      }

      // Upsert profile in Supabase profiles table if available
      if (isSupabaseConfigured) {
        try {
          await supabase.from("profiles").upsert(
            {
              id: finalUser.id,
              display_name: finalUser.name,
              name: finalUser.name,
              email: finalUser.email,
              role: finalUser.role,
              professional_label: finalUser.role,
              organization: finalUser.organization,
              sheets_quota: finalUser.quotaTotal,
            },
            { onConflict: "id" }
          );
        } catch {
          // ignore
        }
      }

      saveUserSession(finalUser);
      setLoading(false);
      return { success: true, user: finalUser };
    }

    // 2. Authoritative verification via Supabase Auth
    if (isSupabaseConfigured) {
      try {
        const verifyType = type === "signup" ? "signup" : "email";
        let { data, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: verifyType,
        });

        // If signup failed, also try email type fallback
        if (error && type === "signup") {
          const retry = await supabase.auth.verifyOtp({
            email: cleanEmail,
            token: cleanToken,
            type: "email",
          });
          if (!retry.error && (retry.data?.session || retry.data?.user)) {
            data = retry.data;
            error = null;
          }
        }

        if (!error && (data?.session || data?.user)) {
          const authUser = data.session?.user || data.user;
          const userId = authUser?.id || `usr_${Date.now()}`;

          // Query live profile
          let dbProfile: any = null;
          try {
            const { data: p } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .maybeSingle();
            dbProfile = p;
          } catch {
            // ignore
          }

          const resolvedUser: User = {
            id: userId,
            name:
              dbProfile?.name ||
              dbProfile?.display_name ||
              pendingUserData?.name ||
              authUser?.user_metadata?.full_name ||
              cleanEmail.split("@")[0],
            email: cleanEmail,
            password: pendingUserData?.password || "admin",
            role:
              dbProfile?.role ||
              dbProfile?.professional_label ||
              pendingUserData?.role ||
              "Residential Architect",
            organization:
              dbProfile?.organization ||
              pendingUserData?.organization ||
              "CYAN/DRAFT ARCHITECTURAL STUDIO",
            avatar: (
              dbProfile?.name ||
              pendingUserData?.name ||
              "MA"
            )
              .substring(0, 2)
              .toUpperCase(),
            quotaUsed: 1,
            quotaTotal: dbProfile?.sheets_quota || 50,
          };

          // Ensure profile row exists in public.profiles
          try {
            await supabase.from("profiles").upsert(
              {
                id: resolvedUser.id,
                display_name: resolvedUser.name,
                name: resolvedUser.name,
                email: resolvedUser.email,
                role: resolvedUser.role,
                professional_label: resolvedUser.role,
                organization: resolvedUser.organization,
                sheets_quota: resolvedUser.quotaTotal,
              },
              { onConflict: "id" }
            );
          } catch {
            // ignore
          }

          saveUserSession(resolvedUser);
          setLoading(false);
          return { success: true, user: resolvedUser };
        }

        setLoading(false);
        return {
          success: false,
          error: error?.message || "Invalid or expired verification code. Please try again.",
        };
      } catch (err: any) {
        setLoading(false);
        return {
          success: false,
          error: err?.message || "Supabase verification service error.",
        };
      }
    }

    setLoading(false);
    return {
      success: false,
      error: "Supabase connection is not active.",
    };
  };

  /**
   * Register with credentials and trigger Supabase OTP
   */
  const registerWithCredentials = async (
    email: string,
    pass: string,
    fullName: string,
    organization: string
  ): Promise<{ success: boolean; error?: string; user?: User; isRateLimited?: boolean }> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const cleanName = fullName.trim();
    const cleanOrg = organization.trim();

    if (!cleanEmail || !cleanPass) {
      setLoading(false);
      return { success: false, error: "Email and password are required." };
    }

    const tempUser: User = {
      id: `usr_${Date.now()}`,
      name: cleanName || cleanEmail.split("@")[0],
      email: cleanEmail,
      password: cleanPass,
      role: "Lead Architect",
      organization: cleanOrg || "CYAN/DRAFT ARCHITECTURAL STUDIO",
      avatar: (cleanName || "AR").substring(0, 2).toUpperCase(),
      quotaUsed: 0,
      quotaTotal: 50,
    };

    // Dispatch Supabase registration & OTP
    const otpRes = await sendOtp(cleanEmail, {
      isSignUp: true,
      fullName: cleanName,
      organization: cleanOrg,
      password: cleanPass,
    });

    setLoading(false);
    return {
      success: otpRes.success,
      error: otpRes.error,
      user: tempUser,
      isRateLimited: otpRes.isRateLimited,
    };
  };

  /**
   * Direct login with email and password (backward compatibility)
   */
  const loginWithCredentials = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    const val = await validateCredentials(email, pass);
    if (val.success && val.user) {
      saveUserSession(val.user);
      return { success: true, user: val.user };
    }
    return val;
  };

  /**
   * One-click demo role or custom login
   */
  const login = async (
    type: "mustafa" | "architect" | "engineer" | "custom" = "mustafa",
    customEmail?: string,
    customName?: string,
    customPassword?: string
  ): Promise<boolean> => {
    setLoading(true);

    if (type === "mustafa") {
      const res = await loginWithCredentials("bscs2312208@szabist.pk", "admin");
      setLoading(false);
      return res.success;
    }

    if (type === "architect") {
      saveUserSession(DEFAULT_ARCHITECT_USER);
      setLoading(false);
      return true;
    }

    if (type === "engineer") {
      saveUserSession(DEFAULT_ENGINEER_USER);
      setLoading(false);
      return true;
    }

    if (type === "custom") {
      const customUser: User = {
        id: `usr_${Date.now()}`,
        name: customName || "Mustafa",
        email: customEmail || "bscs2312208@szabist.pk",
        password: customPassword || "admin",
        role: "Lead Architect",
        organization: "CYAN/DRAFT ARCHITECTURAL STUDIO",
        avatar: (customName || "MA").substring(0, 2).toUpperCase(),
        quotaUsed: 1,
        quotaTotal: 50,
      };
      saveUserSession(customUser);
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  };

  const logout = async () => {
    setUser(null);
    try {
      localStorage.removeItem("buildgen_auth_user");
    } catch {
      // ignore
    }
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
  };

  const openSignInModal = () => setIsSignInModalOpen(true);
  const closeSignInModal = () => setIsSignInModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithCredentials,
        validateCredentials,
        sendOtp,
        verifyOtp,
        registerWithCredentials,
        saveUserSession,
        logout,
        isSignInModalOpen,
        openSignInModal,
        closeSignInModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
