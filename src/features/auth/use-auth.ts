"use client";
import { BLUEPRINT_NODES } from "./data/blueprint-nodes";
import { AuthMode,BlueprintNode } from "./model/page-types";

import { useAuth } from "@/features/auth/client";
import { safeReturnTo,validateCredentials,validateRegistration } from "@/lib/auth/validation";
import gsap from "@/shared/animation";
import { useRouter,useSearchParams } from "next/navigation";
import React,{ useEffect,useLayoutEffect,useRef,useState } from "react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, register, loginWithCredentials, logout } = useAuth();
  const destination = safeReturnTo(searchParams.get("next"));

  const rootRef = useRef<HTMLDivElement>(null);
  const blueprintFrameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const coordXRef = useRef<HTMLSpanElement>(null);
  const coordYRef = useRef<HTMLSpanElement>(null);
  const cursorPxRef = useRef<HTMLDivElement>(null);

  const mode: AuthMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [studioDomain, setStudioDomain] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchRafRef = useRef<number | null>(null);

  const [activeNode, setActiveNode] = useState<BlueprintNode>(BLUEPRINT_NODES[0]);
  const [layers, setLayers] = useState({
    massing: true,
    axes: true,
    vectors: true,
    exploded: false,
  });
  const [authStatus, setAuthStatus] = useState<{
    type: "idle" | "loading" | "success" | "error" | "info";
    message?: string;
  }>({ type: "idle" });
  const notice = authStatus.type !== "idle" ? authStatus
    : searchParams.get("registered") === "1" ? { type: "success", message: "Registration received. Confirm your email if required, then sign in with your password." }
    : searchParams.get("confirmed") === "1" ? { type: "success", message: "Email confirmed. Sign in with your password to continue." }
    : searchParams.get("error") === "confirmation" ? { type: "error", message: "This confirmation link is invalid or expired. Please register again or request a new link from your administrator." }
    : { type: "idle" };
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    if (/access_token|refresh_token/.test(window.location.hash)) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  // Live telemetry micro-jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(10 + Math.floor(Math.random() * 5));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // GSAP Entrance + SVG Drafting Stroke Animations + 3D Mouse Parallax
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Top bar reveal
      tl.fromTo(
        ".js-header-item",
        { y: -18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.06 }
      );

      // Left drafting frame entrance
      tl.fromTo(
        ".js-blueprint-meta",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 },
        "-=0.4"
      );

      tl.fromTo(
        blueprintFrameRef.current,
        { scale: 0.96, opacity: 0, rotateX: 6, rotateY: -6 },
        { scale: 1, opacity: 1, rotateX: 0, rotateY: 0, duration: 0.9, ease: "expo.out" },
        "-=0.45"
      );

      // SVG stroke-dashoffset architectural drawing animation
      const paths = gsap.utils.toArray<SVGGeometryElement>(".js-draw-stroke");
      paths.forEach((path) => {
        const length = path.getTotalLength ? path.getTotalLength() : 800;
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });

      tl.to(
        ".js-draw-stroke",
        {
          strokeDashoffset: 0,
          duration: 1.35,
          stagger: 0.08,
          ease: "power2.inOut",
        },
        "-=0.65"
      );

      tl.fromTo(
        ".js-svg-fill",
        { opacity: 0, scale: 0.94, transformOrigin: "center center" },
        { opacity: 1, scale: 1, duration: 0.8, stagger: 0.12, ease: "back.out(1.4)" },
        "-=0.85"
      );

      // Continuous subtle floating animation on the focal node ring
      gsap.to(".js-node-pulse", {
        scale: 1.65,
        opacity: 0.15,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "center center",
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const clear = () => {
      const f = blueprintFrameRef.current as (HTMLDivElement & { _rect?: DOMRect }) | null;
      if (f) f._rect = undefined;
    };
    window.addEventListener("scroll", clear, { passive: true });
    window.addEventListener("resize", clear, { passive: true });
    return () => {
      window.removeEventListener("scroll", clear);
      window.removeEventListener("resize", clear);
    };
  }, []);

  // Animate mode switch between Sign In and Sign Up
  const handleModeSwitch = (newMode: AuthMode) => {
    if (newMode === mode || submittingRef.current) return;
    setAuthStatus({ type: "idle" });
    setPassword("");
    setConfirmPassword("");
    router.replace(`/sign-in?mode=${newMode}&next=${encodeURIComponent(destination)}`);
  };

  // Animate 3D Explode toggle on the schematic SVG
  useEffect(() => {
    if (!svgRef.current) return;
    gsap.to(".js-layer-massing", {
      x: layers.exploded ? -18 : 0,
      y: layers.exploded ? -14 : 0,
      duration: 0.65,
      ease: "expo.out",
    });
    gsap.to(".js-layer-core", {
      x: layers.exploded ? 16 : 0,
      y: layers.exploded ? 14 : 0,
      duration: 0.65,
      ease: "expo.out",
    });
    gsap.to(".js-layer-annotations", {
      x: layers.exploded ? 8 : 0,
      y: layers.exploded ? -20 : 0,
      duration: 0.65,
      ease: "expo.out",
    });
  }, [layers.exploded]);

  // Global mouse move handler for live GPS telemetry + 3D blueprint tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) return;
    const lat = (37.7749 + (e.clientY / window.innerHeight - 0.5) * 0.015).toFixed(4);
    const lon = (-122.4194 + (e.clientX / window.innerWidth - 0.5) * 0.015).toFixed(4);
    if (coordXRef.current) coordXRef.current.textContent = `${lat}° N`;
    if (coordYRef.current) coordYRef.current.textContent = `${lon}° W`;

    const frame = blueprintFrameRef.current as
      | (HTMLDivElement & {
          _rect?: DOMRect;
          _deep?: NodeListOf<Element>;
          _mid?: NodeListOf<Element>;
          _front?: NodeListOf<Element>;
        })
      | null;
    if (frame) {
      const rect = frame._rect || (frame._rect = frame.getBoundingClientRect());
      const relX = (e.clientX - rect.left) / Math.max(rect.width, 1);
      const relY = (e.clientY - rect.top) / Math.max(rect.height, 1);

      if (relX >= 0 && relX <= 1 && relY >= 0 && relY <= 1 && cursorPxRef.current) {
        cursorPxRef.current.textContent = `CURSOR: [${Math.round(relX * 600)}, ${Math.round(
          relY * 450
        )}]`;
      }

      const tiltX = (relY - 0.5) * -7;
      const tiltY = (relX - 0.5) * 7;

      gsap.to(frame, {
        rotateX: tiltX,
        rotateY: tiltY,
        duration: 0.2,
        ease: "expo.out",
        overwrite: "auto",
        force3D: "auto",
        transformPerspective: 1100,
      });

      const deep = frame._deep || (frame._deep = frame.querySelectorAll(".js-parallax-deep"));
      const mid = frame._mid || (frame._mid = frame.querySelectorAll(".js-parallax-mid"));
      const front = frame._front || (frame._front = frame.querySelectorAll(".js-parallax-front"));

      if (deep.length) {
        gsap.to(deep, {
          x: (relX - 0.5) * -14,
          y: (relY - 0.5) * -14,
          duration: 0.2,
          ease: "expo.out",
          overwrite: "auto",
          force3D: "auto",
        });
      }

      if (mid.length) {
        gsap.to(mid, {
          x: (relX - 0.5) * 12,
          y: (relY - 0.5) * 12,
          duration: 0.2,
          ease: "expo.out",
          overwrite: "auto",
          force3D: "auto",
        });
      }

      if (front.length) {
        gsap.to(front, {
          x: (relX - 0.5) * 22,
          y: (relY - 0.5) * 22,
          duration: 0.2,
          ease: "expo.out",
          overwrite: "auto",
          force3D: "auto",
        });
      }
    }
  };

  // Touch drag handler for mobile 3D blueprint tilt (non-blocking, silky smooth via rAF)
  const handleBlueprintTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleBlueprintTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch || !touchStartRef.current) return;

    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    // If gesture is mostly vertical, let native browser scroll take over without tilting
    if (deltaY > deltaX * 1.3 && deltaY > 12) {
      return;
    }

    const frame = blueprintFrameRef.current as
      | (HTMLDivElement & {
          _rect?: DOMRect;
          _deep?: NodeListOf<Element>;
          _mid?: NodeListOf<Element>;
          _front?: NodeListOf<Element>;
        })
      | null;
    if (!frame) return;

    if (touchRafRef.current) cancelAnimationFrame(touchRafRef.current);
    touchRafRef.current = requestAnimationFrame(() => {
      const rect = frame._rect || (frame._rect = frame.getBoundingClientRect());
      const relX = (touch.clientX - rect.left) / Math.max(rect.width, 1);
      const relY = (touch.clientY - rect.top) / Math.max(rect.height, 1);

      if (relX >= 0 && relX <= 1 && relY >= 0 && relY <= 1 && cursorPxRef.current) {
        cursorPxRef.current.textContent = `CURSOR: [${Math.round(relX * 600)}, ${Math.round(
          relY * 450
        )}]`;
      }

      const tiltX = (relY - 0.5) * -6;
      const tiltY = (relX - 0.5) * 6;

      gsap.to(frame, {
        rotateX: tiltX,
        rotateY: tiltY,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto",
        force3D: "auto",
        transformPerspective: 1100,
      });

      const deep = frame._deep || (frame._deep = frame.querySelectorAll(".js-parallax-deep"));
      const mid = frame._mid || (frame._mid = frame.querySelectorAll(".js-parallax-mid"));
      const front = frame._front || (frame._front = frame.querySelectorAll(".js-parallax-front"));

      if (deep.length) {
        gsap.to(deep, {
          x: (relX - 0.5) * -10,
          y: (relY - 0.5) * -10,
          duration: 0.22,
          ease: "power2.out",
          overwrite: "auto",
          force3D: "auto",
        });
      }

      if (mid.length) {
        gsap.to(mid, {
          x: (relX - 0.5) * 8,
          y: (relY - 0.5) * 8,
          duration: 0.22,
          ease: "power2.out",
          overwrite: "auto",
          force3D: "auto",
        });
      }

      if (front.length) {
        gsap.to(front, {
          x: (relX - 0.5) * 14,
          y: (relY - 0.5) * 14,
          duration: 0.22,
          ease: "power2.out",
          overwrite: "auto",
          force3D: "auto",
        });
      }
    });
  };

  const handleBlueprintTouchEnd = () => {
    touchStartRef.current = null;
    if (touchRafRef.current) cancelAnimationFrame(touchRafRef.current);
    handleBlueprintLeave();
  };

  const handleBlueprintLeave = () => {
    if (!blueprintFrameRef.current) return;
    gsap.to(blueprintFrameRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.28,
      ease: "expo.out",
      overwrite: "auto",
      force3D: "auto",
    });
    gsap.to([".js-parallax-deep", ".js-parallax-mid", ".js-parallax-front"], {
      x: 0,
      y: 0,
      duration: 0.28,
      ease: "expo.out",
      overwrite: "auto",
      force3D: "auto",
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || loading) return;
    const payload = { email, password, confirmPassword, fullName, organization: studioDomain, remember: rememberMe };
    const input = mode === "signup" ? validateRegistration(payload) : validateCredentials(payload);
    if (!input.ok) {
      setAuthStatus({ type: "error", message: input.error });
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    setAuthStatus({ type: "loading", message: mode === "signin" ? "Signing in..." : "Creating your account..." });
    try {
      const result = mode === "signup" ? await register(payload) : await loginWithCredentials(email, password, rememberMe);
      if (!result.success) {
        setAuthStatus({ type: "error", message: result.error || "Authentication failed. Please try again." });
        return;
      }
      setPassword("");
      setConfirmPassword("");
      if (mode === "signup") {
        setAuthStatus({ type: "idle" });
        router.replace(`/sign-in?registered=1&next=${encodeURIComponent(destination)}`);
      } else {
        // Full navigation ensures the server checks the newly established session.
        window.location.assign(destination);
      }
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    const result = await logout();
    if (!result.success) setAuthStatus({ type: "error", message: result.error || "Unable to sign out. Please try again." });
  };
  return { user, loading, destination, rootRef, blueprintFrameRef, svgRef, coordXRef, coordYRef, cursorPxRef, mode, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, fullName, setFullName, studioDomain, setStudioDomain, showPassword, setShowPassword, rememberMe, setRememberMe, isSubmitting, activeNode, setActiveNode, layers, setLayers, notice, latency, handleModeSwitch, handleMouseMove, handleBlueprintTouchStart, handleBlueprintTouchMove, handleBlueprintTouchEnd, handleBlueprintLeave, handleFormSubmit, handleSignOut };
}
