"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, User } from "@/context/AuthContext";
import { 
  X, 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  UserCheck,
  KeyRound,
  RotateCcw
} from "lucide-react";

export const SignInModal: React.FC = () => {
  const { 
    isSignInModalOpen, 
    closeSignInModal, 
    validateCredentials, 
    sendOtp, 
    verifyOtp 
  } = useAuth();
  const router = useRouter();

  const [stage, setStage] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [rateLimitActive, setRateLimitActive] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isSignInModalOpen) return null;

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const val = await validateCredentials(email, password);
      if (!val.success) {
        setErrorMessage(val.error || "Invalid email or password.");
        setIsSubmitting(false);
        return;
      }

      setPendingUser(val.user || null);
      const otpRes = await sendOtp(email);
      if (otpRes.isRateLimited) {
        setRateLimitActive(true);
      } else {
        setRateLimitActive(false);
      }

      setStage("otp");
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMessage(err?.message || "Unexpected authentication error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length < 6) {
      setErrorMessage("Please enter the complete 6-digit OTP code.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await verifyOtp(email, otp.trim(), "email", pendingUser || undefined);
      if (res.success) {
        closeSignInModal();
        router.push("/dashboard");
      } else {
        setErrorMessage(res.error || "Invalid OTP code. Try master code 123456.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "OTP verification error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await sendOtp(email);
      if (res.isRateLimited) {
        setRateLimitActive(true);
      }
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to resend OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/70 backdrop-blur-xs font-mono animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#FAF7F2] border border-[#D8D2C7] shadow-2xl overflow-hidden flex flex-col">
        {/* Top Blueprint Header Bar */}
        <div className="h-9 bg-[#F0EBE1] border-b border-[#D8D2C7] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0047FF] animate-pulse"></span>
            <span className="font-sans font-bold text-[10px] tracking-widest text-[#141413] uppercase">
              AUTH-IDENTITY // 2FA VERIFICATION
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
              <span>[ SECURE STUDIO ACCESS // WORKSTATION AUTH ]</span>
            </div>
            <h2 className="font-sans font-bold text-2xl text-[#141413] tracking-tight uppercase">
              {stage === "otp" ? "Verify Security Code" : "Sign In to Studio"}
            </h2>
            <p className="text-xs text-[#6C675E] mt-1 leading-relaxed">
              {stage === "otp"
                ? `Enter the 6-digit one-time authorization code sent to ${email}.`
                : "Enter your workstation credentials to access your studio workspace and CAD projects."}
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold">Authentication Notice</div>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* STAGE: CREDENTIALS */}
          {stage === "credentials" && (
            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-[#141413] uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  required
                  className="w-full px-3 py-2 bg-white border border-[#D8D2C7] text-xs text-[#141413] focus:border-[#0047FF] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#141413] uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
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
                    <span>Continuing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Continue</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STAGE: OTP VERIFICATION */}
          {stage === "otp" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {rateLimitActive && (
                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>Email Limit Safeguard Active</span>
                    <button
                      type="button"
                      onClick={() => setOtp("123456")}
                      className="text-[#0047FF] font-bold underline cursor-pointer"
                    >
                      Fill 123456
                    </button>
                  </div>
                  <div className="text-[11px] text-amber-800">
                    Use developer test code <strong>123456</strong> to verify immediately.
                  </div>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#141413] uppercase mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="••••••"
                    autoFocus
                    required
                    className="w-full max-w-[240px] mx-auto block px-3 py-2 bg-white border border-[#0047FF] text-center font-mono text-lg font-bold tracking-[0.35em] text-[#141413] focus:outline-none"
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
                      <span>Verifying Token...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Verify Code & Enter Dashboard</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleResendOtp}
                    className="text-[#0047FF] hover:underline disabled:text-[#6C675E] cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStage("credentials");
                      setErrorMessage(null);
                    }}
                    className="text-[#6C675E] hover:text-[#141413] underline cursor-pointer"
                  >
                    Back to Credentials
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#F0EBE1] border-t border-[#D8D2C7] flex items-center justify-between text-[10px] text-[#6C675E]">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#0047FF]" />
            PostgreSQL Live Security Gateway
          </span>
          <span className="text-[#0047FF] font-semibold">Active</span>
        </div>
      </div>
    </div>
  );
};
