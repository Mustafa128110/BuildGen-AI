"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  X, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  UserCheck 
} from "lucide-react";

export const SignInModal: React.FC = () => {
  const { isSignInModalOpen, closeSignInModal, login, loginWithCredentials, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isSignInModalOpen) return null;

  const handleQuickLogin = async (role: "mustafa" | "architect" | "engineer") => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const ok = await login(role);
      if (ok) {
        closeSignInModal();
        router.push("/dashboard");
      } else {
        setErrorMessage("Failed to authenticate session.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Authentication error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await loginWithCredentials(email, password);
      if (res.success) {
        closeSignInModal();
        router.push("/dashboard");
      } else {
        setErrorMessage(res.error || "Invalid email or password.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Unexpected authentication error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/70 backdrop-blur-xs font-mono animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] border border-[#D8D2C7] shadow-2xl overflow-hidden flex flex-col">
        {/* Top Blueprint Header Bar */}
        <div className="h-9 bg-[#F0EBE1] border-b border-[#D8D2C7] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0047FF] animate-pulse"></span>
            <span className="font-sans font-bold text-[10px] tracking-widest text-[#141413] uppercase">
              AUTH-IDENTITY // SUPABASE REVISION
            </span>
          </div>
          <button
            onClick={closeSignInModal}
            className="text-[#6C675E] hover:text-[#141413] transition-colors p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Header Title */}
          <div>
            <div className="text-[10px] text-[#0047FF] font-bold tracking-wider uppercase mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>[ SECURE STUDIO ACCESS // POSTGRESQL AUTH ]</span>
            </div>
            <h2 className="font-sans font-bold text-2xl text-[#141413] tracking-tight uppercase">
              Enter BuildGen Workspace
            </h2>
            <p className="text-xs text-[#6C675E] mt-1 leading-relaxed">
              Authenticate via Supabase live profiles to access residential CAD floor plans, 
              OR-Tools solver revisions, and live takeoff quantities.
            </p>
          </div>

          {/* Quick Profile Section */}
          <div className="space-y-2">
            <div className="text-[10px] text-[#6C675E] tracking-wider uppercase font-semibold flex items-center justify-between">
              <span>ONE-CLICK STUDIO PROFILES</span>
              <span className="text-[#0047FF] text-[9px] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> VERIFIED CREDENTIALS
              </span>
            </div>

            {/* Profile 1: PRIMARY USER - Mustafa (Lead Architect) */}
            <button
              onClick={() => handleQuickLogin("mustafa")}
              disabled={isSubmitting}
              className="w-full p-3 bg-white border-2 border-[#0047FF] hover:bg-[#0047FF]/5 transition-all text-left flex items-center justify-between group shadow-sm cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#0047FF] text-white text-[8px] font-bold uppercase tracking-wider">
                PRIMARY USER
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#0047FF] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  MA
                </div>
                <div>
                  <div className="font-sans font-bold text-sm text-[#141413] group-hover:text-[#0047FF] transition-colors flex items-center gap-1.5">
                    <span>Mustafa</span>
                    <span className="text-[10px] text-[#0047FF] font-mono font-normal">(bscs2312208@szabist.pk)</span>
                  </div>
                  <div className="text-[10px] text-[#6C675E]">
                    Lead Architect • CYAN/DRAFT ARCHITECTURAL STUDIO
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#0047FF]">
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Enter Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>

            {/* Secondary Preset: Alex Vance */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleQuickLogin("architect")}
                disabled={isSubmitting}
                className="p-2.5 bg-white border border-[#D8D2C7] hover:border-[#141413] hover:bg-[#F2EFE9] transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-sans font-bold text-xs text-[#141413]">
                    Alex Vance
                  </div>
                  <div className="text-[9px] text-[#6C675E]">
                    Residential Architect
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-[#6C675E] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleQuickLogin("engineer")}
                disabled={isSubmitting}
                className="p-2.5 bg-white border border-[#D8D2C7] hover:border-[#141413] hover:bg-[#F2EFE9] transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-sans font-bold text-xs text-[#141413]">
                    Sarah Lin, PE
                  </div>
                  <div className="text-[9px] text-[#6C675E]">
                    Structural Engineer
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-[#6C675E] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-[#D8D2C7]"></div>
            <span className="text-[9px] text-[#6C675E] uppercase tracking-wider font-semibold">
              OR LOG IN WITH PASSWORD
            </span>
            <div className="flex-1 h-[1px] bg-[#D8D2C7]"></div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold">Authentication Refused</div>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Manual Input Form */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-semibold text-[#141413] uppercase">
                  Studio Email
                </label>
                <span className="text-[9px] text-[#6C675E]">Mustafa: bscs2312208@szabist.pk</span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bscs2312208@szabist.pk"
                required
                className="w-full px-3 py-2 bg-white border border-[#D8D2C7] text-xs text-[#141413] focus:border-[#0047FF] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-semibold text-[#141413] uppercase">
                  Passphrase / Password
                </label>
                <span className="text-[9px] text-[#6C675E]">Passphrase: admin</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin"
                required
                className="w-full px-3 py-2 bg-white border border-[#D8D2C7] text-xs text-[#141413] focus:border-[#0047FF] focus:outline-none transition-colors font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#0047FF] hover:bg-[#0038E0] text-white font-mono text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authenticate & Open Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#F0EBE1] border-t border-[#D8D2C7] flex items-center justify-between text-[10px] text-[#6C675E]">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#0047FF]" />
            PostgreSQL Live Profile: <strong className="text-[#141413]">Mustafa</strong>
          </span>
          <span className="text-[#0047FF] font-semibold">Supabase Connected</span>
        </div>
      </div>
    </div>
  );
};
