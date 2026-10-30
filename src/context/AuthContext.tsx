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
   * Log in with email and password, validating against Supabase Auth & public.profiles
   */
  const loginWithCredentials = async (
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

        // Attempt Supabase live query & session
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

            // Also sign in to Supabase GoTrue in background
            await supabase.auth.signInWithPassword({
              email: "bscs2312208@szabist.pk",
              password: "admin",
            });
          } catch (e) {
            console.warn("Supabase auth background sync:", e);
          }
        }

        saveUserSession(userObj);
        setLoading(false);
        return { success: true, user: userObj };
      }

      // 2. Query public.profiles for any other registered user
      if (isSupabaseConfigured) {
        const { data: profile, error: pErr } = await supabase
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
            role: profile.role || "Architect",
            organization: profile.organization || "CYAN/DRAFT ARCHITECTURAL STUDIO",
            avatar: profile.avatar_url || (profile.name || "AR").substring(0, 2).toUpperCase(),
            quotaUsed: 2,
            quotaTotal: profile.sheets_quota || 25,
          };

          // Also attempt GoTrue sign-in
          try {
            await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: cleanPass,
            });
          } catch {
            // ignore GoTrue error if profile password verified
          }

          saveUserSession(userObj);
          setLoading(false);
          return { success: true, user: userObj };
        }

        // Try standard Supabase Auth
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (!authErr && authData?.user) {
          const userObj: User = {
            id: authData.user.id,
            name: authData.user.user_metadata?.name || cleanEmail.split("@")[0],
            email: authData.user.email || cleanEmail,
            password: cleanPass,
            role: authData.user.user_metadata?.role || "Lead Architect",
            organization: "CYAN/DRAFT ARCHITECTURAL STUDIO",
            avatar: (authData.user.user_metadata?.name || "AR").substring(0, 2).toUpperCase(),
            quotaUsed: 1,
            quotaTotal: 50,
          };
          saveUserSession(userObj);
          setLoading(false);
          return { success: true, user: userObj };
        }
      }

      // 3. Fallback demo users check
      if (cleanEmail === DEFAULT_ARCHITECT_USER.email && cleanPass === "admin") {
        saveUserSession(DEFAULT_ARCHITECT_USER);
        setLoading(false);
        return { success: true, user: DEFAULT_ARCHITECT_USER };
      }
      if (cleanEmail === DEFAULT_ENGINEER_USER.email && cleanPass === "admin") {
        saveUserSession(DEFAULT_ENGINEER_USER);
        setLoading(false);
        return { success: true, user: DEFAULT_ENGINEER_USER };
      }

      setLoading(false);
      return {
        success: false,
        error: "Invalid studio credentials. Use bscs2312208@szabist.pk / admin for Mustafa.",
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
