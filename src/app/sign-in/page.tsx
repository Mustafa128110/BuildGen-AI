"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";

type AuthMode = "signin" | "signup";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface BlueprintNode {
  id: string;
  label: string;
  sublabel: string;
  cx: number;
  cy: number;
  elevation: string;
  load: string;
}

const BLUEPRINT_NODES: BlueprintNode[] = [
  {
    id: "NODE A-109",
    label: "NODE A-109",
    sublabel: "APEX +24.50",
    cx: 420,
    cy: 120,
    elevation: "+24.50m",
    load: "142.8 kN // CANTILEVER",
  },
  {
    id: "NODE B-204",
    label: "NODE B-204",
    sublabel: "DATUM +14.20",
    cx: 180,
    cy: 120,
    elevation: "+14.20m",
    load: "218.4 kN // SHEAR CORE",
  },
  {
    id: "NODE C-312",
    label: "NODE C-312",
    sublabel: "PLINTH 0.00",
    cx: 100,
    cy: 330,
    elevation: "+0.00m",
    load: "390.0 kN // FOUNDATION",
  },
  {
    id: "NODE D-408",
    label: "NODE D-408",
    sublabel: "SPAN +18.60",
    cx: 520,
    cy: 260,
    elevation: "+18.60m",
    load: "164.2 kN // TRUSS",
  },
];

export default function SignInPage() {
  const router = useRouter();
  const { login, loginWithCredentials } = useAuth();

  const rootRef = useRef<HTMLDivElement>(null);
  const blueprintFrameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const coordXRef = useRef<HTMLSpanElement>(null);
  const coordYRef = useRef<HTMLSpanElement>(null);
  const cursorPxRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [studioDomain, setStudioDomain] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
  const [latency, setLatency] = useState(12);

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

      // Right auth portal staggered entrance
      tl.fromTo(
        ".js-auth-item",
        { x: 24, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.65, stagger: 0.06 },
        "-=1.0"
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
    if (newMode === mode) return;
    setAuthStatus({ type: "idle" });
    if (formCardRef.current) {
      gsap.fromTo(
        formCardRef.current,
        { y: 10, opacity: 0.35 },
        { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }
      );
    }
    setMode(newMode);
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

  // Magnetic button hover effect
  const handleMagneticMove = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement & { _rect?: DOMRect };
    const rect = target._rect || (target._rect = target.getBoundingClientRect());
    const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
    gsap.to(target, {
      x,
      y,
      duration: 0.16,
      ease: "expo.out",
      overwrite: "auto",
      force3D: "auto",
    });
  };

  const handleMagneticReset = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.24,
      ease: "expo.out",
      overwrite: "auto",
      force3D: "auto",
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthStatus({
      type: "loading",
      message:
        mode === "signin"
          ? "VERIFYING WORKSTATION TOKEN & BIM CREDENTIALS..."
          : "PROVISIONING STUDIO TENANT & INITIALIZING GRAPH...",
    });

    if (submitBtnRef.current) {
      gsap.fromTo(
        submitBtnRef.current,
        { scale: 0.98 },
        { scale: 1, duration: 0.3, ease: "back.out(2)" }
      );
    }

    // Try matching credentials first if user entered a custom username/password
    if (mode === "signin" && email && password) {
      const res = await loginWithCredentials(email, password);
      if (res.success) {
        setAuthStatus({
          type: "success",
          message: "WORKSTATION AUTHENTICATED // REDIRECTING TO STUDIO...",
        });
        setTimeout(() => router.push("/dashboard"), 650);
        return;
      }
    }

    // Fallback or studio seat login
    if (mode === "signup") {
      await login("custom", email, fullName, password);
    } else {
      await login("mustafa");
    }

    setTimeout(() => {
      setAuthStatus({
        type: "success",
        message:
          mode === "signin"
            ? "SESSION SYNCHRONIZED // OPENING ARCHITECTURAL PROJECTS..."
            : `SEAT PROVISIONED FOR ${fullName.toUpperCase()} // LAUNCHING...`,
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 650);
    }, 550);
  };

  const handleSSOLogin = async (provider: string) => {
    setAuthStatus({
      type: "loading",
      message: `HANDSHAKING WITH ${provider.toUpperCase()} FEDERATED GATEWAY...`,
    });
    await login("mustafa");
    setTimeout(() => {
      setAuthStatus({
        type: "success",
        message: `${provider.toUpperCase()} TOKEN VERIFIED // REDIRECTING...`,
      });
      setTimeout(() => router.push("/dashboard"), 500);
    }, 500);
  };

  return (
    <div
      ref={rootRef}
      onMouseMove={handleMouseMove}
      className="tactile-editorial-root bg-surface-canvas text-ink-black min-h-screen flex flex-col justify-between selection:bg-cobalt-electric selection:text-paper-white overflow-x-hidden overflow-y-auto relative"
    >
      {/* Subtle Paper Noise Overlay */}
      <div className="paper-grain" />

      {/* Top System Header Strip */}
      <header className="w-full border-b border-hairline-border bg-surface-canvas/90 backdrop-blur-xs z-30 relative">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          {/* Left: Brand & Build Version */}
          <div className="flex items-center space-x-6 js-header-item">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-5 h-5 bg-cobalt-electric flex items-center justify-center border border-ink-black transition-transform duration-300 group-hover:rotate-90">
                <div className="w-2 h-2 bg-paper-white" />
              </div>
              <span className="font-mono text-sm font-bold tracking-widest uppercase text-ink-black">
                ILLOCA
              </span>
            </Link>
            <span className="hidden sm:inline-block text-hairline-border-strong">|</span>
            <span className="hidden sm:inline-block font-mono text-[11px] tracking-wider text-graphite-muted uppercase">
              ARC-049 // SECURE PORTAL
            </span>
          </div>

          {/* Center: Live Coordinate Telemetry */}
          <div className="hidden lg:flex items-center space-x-6 font-mono text-[11px] tracking-wider text-graphite-muted tabular-nums js-header-item">
            <div>
              <span className="text-ink-black font-semibold">X:</span>{" "}
              <span ref={coordXRef}>37.7749° N</span>
            </div>
            <div>
              <span className="text-ink-black font-semibold">Y:</span>{" "}
              <span ref={coordYRef}>-122.4194° W</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-cobalt-electric inline-block" />
              <span>EPSG: 3857 WGS84</span>
            </div>
            <div className="text-pencil-gray">SCALE: 1:100</div>
          </div>

          {/* Right: Support & Navigation */}
          <div className="flex items-center space-x-3 sm:space-x-5 js-header-item">
            <Link
              href="/dashboard"
              className="font-mono text-[11px] tracking-wider uppercase text-graphite-muted hover:text-cobalt-electric transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/studio"
              className="hidden md:inline-block font-mono text-[11px] tracking-wider uppercase text-graphite-muted hover:text-cobalt-electric transition-colors"
            >
              Studio Canvas
            </Link>
            <a
              href="mailto:hello@illoca.com"
              className="hidden sm:inline-block font-mono text-[11px] tracking-wider text-graphite-muted hover:text-ink-black transition-colors"
            >
              hello@illoca.com
            </a>
            <Link
              href="/about"
              className="font-mono text-[11px] tracking-wider uppercase text-ink-black hover:text-cobalt-electric transition-colors flex items-center space-x-1 border-b border-dotted border-ink-black pb-0.5 group"
            >
              <span className="hidden sm:inline">Tracing Paper Docs</span>
              <span className="sm:hidden">About</span>
              <span className="material-symbols-outlined text-[14px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                north_east
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split-Screen Architecture */}
      <main className="flex-grow flex items-stretch relative z-10">
        <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 w-full">
          {/* LEFT PANE: Technical Orthographic Drafting Blueprint Graphic (7 Columns) */}
          <section
            onMouseLeave={handleBlueprintLeave}
            className="flex col-span-1 lg:col-span-7 border-b lg:border-b-0 lg:border-r border-hairline-border drafting-grid-bg relative flex-col justify-between p-4 sm:p-6 lg:p-10 xl:p-14 overflow-hidden order-2 lg:order-1 touch-pan-y"
          >
            {/* Top Blueprint Metadata Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10 js-blueprint-meta">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 bg-surface-bone border border-hairline-border-strong px-2.5 py-1">
                  <span className="w-2 h-2 bg-cadmium-vermilion animate-pulse" />
                  <span className="font-mono text-[10px] tracking-widest uppercase text-ink-black font-semibold">
                    ORTHOGRAPHIC PROJECTION // SCHEMATIC 04
                  </span>
                </div>
                <p className="hidden sm:block font-mono text-[11px] text-graphite-muted pl-1">
                  FIG 1.2 — SPATIAL MASSING &amp; VECTOR TOPOLOGY ENGINE
                </p>
              </div>

              {/* Interactive Layer Toggles */}
              <div className="flex flex-wrap items-center gap-1.5 sm:space-y-2 sm:flex-col sm:items-end">
                <div className="hidden sm:block border border-hairline-border bg-surface-canvas/90 px-3 py-2 font-mono text-[10px] text-graphite-muted space-y-0.5 text-right">
                  <div className="text-ink-black font-semibold">GRID SYNCHRONIZED</div>
                  <div>SNAP: 150mm INCREMENT</div>
                  <div ref={cursorPxRef}>CURSOR: [300, 225]</div>
                </div>
                <div className="flex items-center space-x-1">
                  {(
                    [
                      { key: "massing", label: "MASS" },
                      { key: "axes", label: "AXES" },
                      { key: "vectors", label: "VECT" },
                      { key: "exploded", label: "EXPLODE 3D" },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setLayers((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                      }
                      className={`px-2 py-1 sm:py-0.5 font-mono text-[9px] uppercase tracking-wider border transition-colors cursor-pointer touch-manipulation ${
                        layers[item.key]
                          ? item.key === "exploded"
                            ? "bg-cadmium-vermilion text-paper-white border-ink-black"
                            : "bg-ink-black text-paper-white border-ink-black"
                          : "bg-surface-canvas text-graphite-muted border-hairline-border hover:border-ink-black"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Central Drafting Canvas Frame (Interactive 3D Tilt & Parallax) */}
            <div
              ref={blueprintFrameRef}
              onTouchStart={handleBlueprintTouchStart}
              onTouchMove={handleBlueprintTouchMove}
              onTouchEnd={handleBlueprintTouchEnd}
              onTouchCancel={handleBlueprintTouchEnd}
              className="relative my-auto py-8 flex items-center justify-center touch-pan-y"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Outer Perimeter Datum Box */}
              <div className="w-full max-w-[580px] aspect-[4/3] border border-hairline-border-strong bg-surface-canvas/75 relative p-6 shadow-[4px_4px_0px_rgba(33,33,33,0.08)]">
                {/* Corner Registration L-Ticks */}
                <div className="corner-tick corner-tl" />
                <div className="corner-tick corner-tr" />
                <div className="corner-tick corner-bl" />
                <div className="corner-tick corner-br" />

                {/* Top Dimension Callout */}
                <div className="js-parallax-mid absolute -top-3 left-12 bg-surface-canvas px-2 font-mono text-[10px] text-graphite-muted flex items-center space-x-2 border border-hairline-border">
                  <span>ELEVATION +14.20m</span>
                  <span className="text-cadmium-vermilion">//</span>
                  <span>DATUM 0.00</span>
                </div>

                {/* Right Vertical Dimension Ruler */}
                <div className="absolute top-1/2 -right-8 -translate-y-1/2 rotate-90 font-mono text-[10px] tracking-widest text-pencil-gray uppercase">
                  SECTION A-A&apos; // CANTILEVER STUDY
                </div>

                {/* Vector Architectural Schematic SVG */}
                <svg
                  ref={svgRef}
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 600 450"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Construction Axis Lines */}
                  {layers.axes && (
                    <g className="js-parallax-deep">
                      <line
                        className="js-draw-stroke"
                        x1="100"
                        y1="0"
                        x2="100"
                        y2="450"
                        stroke="#9C9C9C"
                        strokeWidth="0.75"
                        strokeDasharray="4 4"
                      />
                      <line
                        className="js-draw-stroke"
                        x1="420"
                        y1="0"
                        x2="420"
                        y2="450"
                        stroke="#9C9C9C"
                        strokeWidth="0.75"
                        strokeDasharray="4 4"
                      />
                      <line
                        className="js-draw-stroke"
                        x1="0"
                        y1="120"
                        x2="600"
                        y2="120"
                        stroke="#9C9C9C"
                        strokeWidth="0.75"
                        strokeDasharray="4 4"
                      />
                      <line
                        className="js-draw-stroke"
                        x1="0"
                        y1="330"
                        x2="600"
                        y2="330"
                        stroke="#9C9C9C"
                        strokeWidth="0.75"
                        strokeDasharray="4 4"
                      />
                    </g>
                  )}

                  {/* Diagonal Projection Vectors */}
                  {layers.vectors && (
                    <g className="js-parallax-deep">
                      <line
                        className="js-draw-stroke"
                        x1="100"
                        y1="330"
                        x2="420"
                        y2="120"
                        stroke="#3B60C5"
                        strokeWidth="0.75"
                        strokeDasharray="2 3"
                      />
                      <line
                        className="js-draw-stroke"
                        x1="100"
                        y1="120"
                        x2="520"
                        y2="330"
                        stroke="#3B60C5"
                        strokeWidth="0.75"
                        strokeDasharray="2 3"
                      />
                    </g>
                  )}

                  {/* Primary Structural Footprint Massing (Cobalt Highlight) */}
                  {layers.massing && (
                    <g className="js-layer-massing js-parallax-mid">
                      <polygon
                        className="js-svg-fill transition-all duration-300 hover:fill-[#3B60C5]/20 cursor-pointer"
                        points="100,220 260,120 420,120 420,280 260,330 100,330"
                        fill="rgba(59, 96, 197, 0.08)"
                        stroke="#3B60C5"
                        strokeWidth="1.5"
                      />
                      <path
                        className="js-draw-stroke"
                        d="M180 120 L420 120 L520 190 L520 260 L420 260"
                        stroke="#3B60C5"
                        strokeWidth="1.25"
                      />
                    </g>
                  )}

                  {/* Secondary Volume Core (Bone / Ink Outline) */}
                  <g className="js-layer-core js-parallax-mid">
                    <rect
                      className="js-svg-fill"
                      x="180"
                      y="160"
                      width="180"
                      height="130"
                      fill="#EAE0CE"
                      fillOpacity="0.75"
                      stroke="#212121"
                      strokeWidth="1.5"
                    />

                    {/* Inner Structural Grid / Partition Lines */}
                    <line
                      className="js-draw-stroke"
                      x1="240"
                      y1="160"
                      x2="240"
                      y2="290"
                      stroke="#212121"
                      strokeWidth="1"
                    />
                    <line
                      className="js-draw-stroke"
                      x1="180"
                      y1="225"
                      x2="360"
                      y2="225"
                      stroke="#212121"
                      strokeWidth="1"
                    />

                    {/* Structural Column Nodes */}
                    <rect x="176" y="156" width="8" height="8" fill="#212121" />
                    <rect x="236" y="156" width="8" height="8" fill="#212121" />
                    <rect x="356" y="156" width="8" height="8" fill="#212121" />
                    <rect x="176" y="286" width="8" height="8" fill="#212121" />
                    <rect x="236" y="286" width="8" height="8" fill="#212121" />
                    <rect x="356" y="286" width="8" height="8" fill="#212121" />
                  </g>

                  {/* Vermilion Dimension Arc & Focal Annotations */}
                  <g className="js-layer-annotations js-parallax-front">
                    <path
                      className="js-draw-stroke"
                      d="M 420 180 A 60 60 0 0 1 480 240"
                      stroke="#EC633D"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                    <text
                      x="462"
                      y="204"
                      fill="#EC633D"
                      fontFamily="JetBrains Mono"
                      fontSize="10"
                      fontWeight="600"
                    >
                      R 12.4m
                    </text>

                    {/* Interactive Blueprint Nodes */}
                    {BLUEPRINT_NODES.map((node) => {
                      const isSelected = activeNode.id === node.id;
                      return (
                        <g
                          key={node.id}
                          onClick={() => setActiveNode(node)}
                          onMouseEnter={() => setActiveNode(node)}
                          className="cursor-pointer"
                        >
                          {isSelected && (
                            <circle
                              className="js-node-pulse"
                              cx={node.cx}
                              cy={node.cy}
                              r="12"
                              stroke="#EC633D"
                              strokeWidth="1.25"
                              fill="rgba(236, 99, 61, 0.15)"
                            />
                          )}
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={isSelected ? "5.5" : "4"}
                            fill={isSelected ? "#EC633D" : "#3B60C5"}
                            stroke="#FDF8F0"
                            strokeWidth="1.5"
                          />
                        </g>
                      );
                    })}

                    {/* Active Node Callout Tag */}
                    <line
                      x1={activeNode.cx}
                      y1={activeNode.cy}
                      x2={Math.min(activeNode.cx + 45, 465)}
                      y2={Math.max(activeNode.cy - 45, 55)}
                      stroke="#EC633D"
                      strokeWidth="1"
                    />
                    <rect
                      x={Math.min(activeNode.cx + 45, 455)}
                      y={Math.max(activeNode.cy - 62, 38)}
                      width="124"
                      height="36"
                      fill="#FDF8F0"
                      stroke="#EC633D"
                      strokeWidth="1"
                    />
                    <text
                      x={Math.min(activeNode.cx + 53, 463)}
                      y={Math.max(activeNode.cy - 46, 54)}
                      fill="#212121"
                      fontFamily="JetBrains Mono"
                      fontSize="9"
                      fontWeight="600"
                    >
                      {activeNode.label}
                    </text>
                    <text
                      x={Math.min(activeNode.cx + 53, 463)}
                      y={Math.max(activeNode.cy - 34, 66)}
                      fill="#5B5B5B"
                      fontFamily="JetBrains Mono"
                      fontSize="8"
                    >
                      {activeNode.sublabel}
                    </text>

                    {/* Architectural Coordinate Tags inside SVG */}
                    <text
                      x="106"
                      y="112"
                      fill="#5B5B5B"
                      fontFamily="JetBrains Mono"
                      fontSize="9"
                    >
                      ZONE 01 // MASSING CORE
                    </text>
                    <text
                      x="186"
                      y="278"
                      fill="#212121"
                      fontFamily="JetBrains Mono"
                      fontSize="10"
                      fontWeight="600"
                    >
                      A-104 [240.5 m²]
                    </text>
                    <text
                      x="105"
                      y="348"
                      fill="#3B60C5"
                      fontFamily="JetBrains Mono"
                      fontSize="9"
                    >
                      STRUCTURAL GRID: 6.0m x 6.0m // BIM LOD 350
                    </text>
                  </g>
                </svg>

                {/* Bottom-Left Scale Bar inside Frame */}
                <div className="js-parallax-front absolute bottom-4 left-6 flex items-center space-x-3">
                  <div className="flex items-center">
                    <div className="w-6 h-1.5 bg-ink-black" />
                    <div className="w-6 h-1.5 bg-surface-canvas border-y border-r border-ink-black" />
                    <div className="w-6 h-1.5 bg-ink-black" />
                  </div>
                  <span className="font-mono text-[9px] tracking-wider text-graphite-muted">
                    0 &mdash; 5m &mdash; 10m
                  </span>
                </div>

                {/* Bottom-Right Live Node Telemetry Chip */}
                <div className="js-parallax-front absolute bottom-4 right-6 bg-surface-bone/90 border border-hairline-border px-2.5 py-1 font-mono text-[9px] text-ink-black flex items-center space-x-2">
                  <span className="text-cobalt-electric font-bold">{activeNode.id}:</span>
                  <span>{activeNode.load}</span>
                </div>
              </div>
            </div>

            {/* Bottom Editorial Quote & System Status */}
            <div className="hidden lg:flex relative z-10 border-t border-hairline-border pt-6 items-end justify-between gap-8 js-blueprint-meta">
              <div className="max-w-md space-y-2">
                <p className="font-serif italic text-xl text-ink-black leading-snug">
                  &ldquo;The intelligent canvas that thinks with you, not for you &mdash;
                  translating architectural intent into editable 2D plans and 3D BIM massing at
                  the speed of thought.&rdquo;
                </p>
                <div className="font-mono text-[10px] tracking-widest uppercase text-graphite-muted">
                  ILLOCA ARCHITECTURAL ENGINE // BUILD 4.2.0
                </div>
              </div>
              <div className="font-mono text-[10px] text-graphite-muted text-right shrink-0 space-y-1">
                <div>
                  SESSION KEY: <span className="text-ink-black">884-992-ILLOCA</span>
                </div>
                <div>
                  LATENCY: <span className="text-cobalt-electric">{latency}ms // EDGE</span>
                </div>
                <div>
                  ENCRYPTION: <span className="text-ink-black">TLS 1.3 // AES-256</span>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT PANE: Authentication & Studio Access Portal (5 Columns) */}
          <section className="col-span-1 lg:col-span-5 bg-surface-canvas flex flex-col justify-between p-6 sm:p-10 xl:p-14 relative order-1 lg:order-2">
            {/* Corner Technical Markers */}
            <div className="hidden sm:block corner-tick corner-tl mt-4 ml-4" />
            <div className="hidden sm:block corner-tick corner-br mb-4 mr-4" />

            {/* Top Sheet Index Header + Mode Switcher */}
            <div className="flex items-center justify-between border-b border-hairline-border pb-4 js-auth-item">
              <div className="flex items-center space-x-1 bg-surface-bone p-1 border border-hairline-border">
                <button
                  type="button"
                  onClick={() => handleModeSwitch("signin")}
                  className={`px-3 py-1 font-mono text-[10px] tracking-widest uppercase transition-colors cursor-pointer ${
                    mode === "signin"
                      ? "bg-ink-black text-paper-white font-semibold"
                      : "text-graphite-muted hover:text-ink-black"
                  }`}
                >
                  01 // Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch("signup")}
                  className={`px-3 py-1 font-mono text-[10px] tracking-widest uppercase transition-colors cursor-pointer ${
                    mode === "signup"
                      ? "bg-cadmium-vermilion text-paper-white font-semibold"
                      : "text-graphite-muted hover:text-ink-black"
                  }`}
                >
                  02 // Request Seat
                </button>
              </div>
              <span className="font-mono text-[11px] tracking-widest uppercase text-cobalt-electric font-medium flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-cobalt-electric inline-block" />
                <span>READY</span>
              </span>
            </div>

            {/* Center Form Module */}
            <div ref={formCardRef} className="my-auto py-8 w-full max-w-[420px] mx-auto">
              {/* Section Title */}
              <div className="mb-8 space-y-2 js-auth-item">
                <div className="inline-flex items-center space-x-2">
                  <span className="w-2 h-2 bg-cadmium-vermilion inline-block" />
                  <span className="font-mono text-[11px] uppercase tracking-widest text-graphite-muted">
                    {mode === "signin"
                      ? "AUTHENTICATION PORTAL"
                      : "STUDIO SEAT PROVISIONING"}
                  </span>
                </div>
                <h1 className="font-serif text-4xl sm:text-[42px] text-ink-black leading-[1.08] tracking-tight">
                  {mode === "signin"
                    ? "Sign in to your studio."
                    : "Commission your studio seat."}
                </h1>
                <p className="font-mono text-[11px] tracking-wider text-graphite-muted uppercase pt-1">
                  ILLOCA &mdash; ARCHITECTURAL INTELLIGENCE STUDIO
                </p>
              </div>

              {/* Status Banner if Active */}
              {authStatus.type !== "idle" && (
                <div
                  className={`mb-5 p-3 border font-mono text-[11px] flex items-center space-x-2.5 ${
                    authStatus.type === "error"
                      ? "bg-cadmium-vermilion/10 border-cadmium-vermilion text-cadmium-vermilion"
                      : authStatus.type === "success"
                      ? "bg-cobalt-electric/10 border-cobalt-electric text-cobalt-electric"
                      : "bg-surface-bone border-ink-black text-ink-black"
                  }`}
                >
                  <span className="w-2 h-2 bg-current animate-ping shrink-0" />
                  <span>{authStatus.message}</span>
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleFormSubmit} className="space-y-5">
                {mode === "signup" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="fullName"
                          className="font-mono text-[11px] uppercase tracking-wider text-ink-black font-semibold"
                        >
                          Principal Architect
                        </label>
                        <span className="font-mono text-[9px] text-pencil-gray">00A</span>
                      </div>
                      <div className="relative">
                        <input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="w-full h-11 px-3.5 bg-paper-white border border-hairline-border-strong text-ink-black font-sans text-sm focus:outline-none focus:border-cobalt-electric focus:ring-0 transition-colors"
                        />
                        <div className="w-1.5 h-1.5 bg-cobalt-electric absolute top-1.5 right-1.5 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="studioDomain"
                          className="font-mono text-[11px] uppercase tracking-wider text-ink-black font-semibold"
                        >
                          Practice Domain
                        </label>
                        <span className="font-mono text-[9px] text-pencil-gray">00B</span>
                      </div>
                      <div className="relative">
                        <input
                          id="studioDomain"
                          type="text"
                          value={studioDomain}
                          onChange={(e) => setStudioDomain(e.target.value)}
                          required
                          className="w-full h-11 px-3.5 bg-paper-white border border-hairline-border-strong text-ink-black font-mono text-xs focus:outline-none focus:border-cobalt-electric focus:ring-0 transition-colors"
                        />
                        <div className="w-1.5 h-1.5 bg-cadmium-vermilion absolute top-1.5 right-1.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Input 01: Work Email */}
                <div className="space-y-2 js-auth-item">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="font-mono text-[11px] uppercase tracking-wider text-ink-black font-semibold"
                    >
                      Work Email
                    </label>
                    <span className="font-mono text-[10px] text-pencil-gray">
                      01 // CREDENTIAL
                    </span>
                  </div>
                  <div className="relative group">
                    <input
                      id="email"
                      name="email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="architect@studio-domain.com"
                      className="w-full h-12 px-4 bg-paper-white border border-hairline-border-strong text-ink-black font-sans text-sm placeholder:text-pencil-gray focus:outline-none focus:border-cobalt-electric focus:ring-0 transition-colors"
                    />
                    <div className="w-1.5 h-1.5 bg-hairline-border-strong group-focus-within:bg-cobalt-electric absolute top-1.5 right-1.5 pointer-events-none transition-colors" />
                  </div>
                </div>

                {/* Input 02: Workstation Password */}
                <div className="space-y-2 js-auth-item">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="font-mono text-[11px] uppercase tracking-wider text-ink-black font-semibold"
                    >
                      Workstation Password
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setAuthStatus({
                          type: "info",
                          message:
                            "HARDWARE KEY RECOVERY DISPATCHED TO STUDIO ADMINISTRATOR.",
                        })
                      }
                      className="font-mono text-[11px] text-cobalt-electric hover:text-cadmium-vermilion underline decoration-dotted underline-offset-4 transition-colors cursor-pointer"
                    >
                      Recover Key?
                    </button>
                  </div>
                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter workstation password"
                      className="w-full h-12 px-4 pr-10 bg-paper-white border border-hairline-border-strong text-ink-black font-sans text-sm placeholder:text-pencil-gray focus:outline-none focus:border-cobalt-electric focus:ring-0 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite-muted hover:text-ink-black transition-colors cursor-pointer"
                      aria-label="Toggle Password Visibility"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Workstation Persistence Option */}
                <div className="flex items-center justify-between pt-1 js-auth-item">
                  <label className="inline-flex items-center space-x-2.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 bg-paper-white border border-hairline-border-strong text-cobalt-electric focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="font-sans text-xs text-graphite-muted group-hover:text-ink-black transition-colors">
                      Remember workstation for 30 days (Hardware Token)
                    </span>
                  </label>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2 js-auth-item">
                  <button
                    ref={submitBtnRef}
                    type="submit"
                    onMouseMove={handleMagneticMove}
                    onMouseLeave={handleMagneticReset}
                    className="tactile-btn w-full h-12 bg-cobalt-electric hover:bg-[#2F50B0] text-paper-white border border-ink-black flex items-center justify-between px-5 group cursor-pointer"
                  >
                    <span className="font-mono text-xs font-semibold uppercase tracking-widest">
                      {mode === "signin"
                        ? "Sign In to Workspace"
                        : "Provision Studio Workspace"}
                    </span>
                    <div className="w-7 h-7 bg-cadmium-vermilion border border-ink-black flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <span className="material-symbols-outlined text-paper-white text-[16px]">
                        arrow_forward
                      </span>
                    </div>
                  </button>
                </div>
              </form>

              {/* Technical Divider: Federated SSO */}
              <div className="relative my-8 flex items-center justify-center js-auth-item">
                <div className="border-t border-hairline-border w-full" />
                <span className="bg-surface-canvas px-3 font-mono text-[10px] uppercase tracking-widest text-graphite-muted shrink-0">
                  Federated Domain SSO
                </span>
                <div className="border-t border-hairline-border w-full" />
              </div>

              {/* Secondary SSO Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 js-auth-item">
                {/* Autodesk SSO */}
                <button
                  type="button"
                  onClick={() => handleSSOLogin("Autodesk BIM ID")}
                  onMouseMove={handleMagneticMove}
                  onMouseLeave={handleMagneticReset}
                  className="tactile-btn-secondary h-11 bg-surface-bone/60 hover:bg-surface-bone border border-hairline-border-strong flex items-center justify-center space-x-2 px-3 group cursor-pointer"
                >
                  <svg
                    className="w-3.5 h-3.5 text-ink-black shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14.6 3L3 20.2h4.7l2.4-3.7h7.7l2.3 3.7H24L14.6 3zm-2.3 10L14.5 9l2.3 4h-4.5z" />
                  </svg>
                  <span className="font-mono text-[11px] font-medium text-ink-black tracking-tight">
                    Autodesk ID
                  </span>
                </button>

                {/* Google Workspace SSO */}
                <button
                  type="button"
                  onClick={() => handleSSOLogin("Google SAML")}
                  onMouseMove={handleMagneticMove}
                  onMouseLeave={handleMagneticReset}
                  className="tactile-btn-secondary h-11 bg-surface-bone/60 hover:bg-surface-bone border border-hairline-border-strong flex items-center justify-center space-x-2 px-3 group cursor-pointer"
                >
                  <svg
                    className="w-3.5 h-3.5 text-ink-black shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z" />
                  </svg>
                  <span className="font-mono text-[11px] font-medium text-ink-black tracking-tight">
                    Google SAML
                  </span>
                </button>

                {/* GitHub / Enterprise PKCE */}
                <button
                  type="button"
                  onClick={() => handleSSOLogin("Enterprise PKCE")}
                  onMouseMove={handleMagneticMove}
                  onMouseLeave={handleMagneticReset}
                  className="tactile-btn-secondary h-11 bg-surface-bone/60 hover:bg-surface-bone border border-hairline-border-strong flex items-center justify-center space-x-2 px-3 group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px] text-cobalt-electric">
                    hub
                  </span>
                  <span className="font-mono text-[11px] font-medium text-ink-black tracking-tight">
                    Enterprise PKCE
                  </span>
                </button>
              </div>

              {/* Enterprise Tenant Notice Card */}
              <div className="mt-8 p-4 bg-surface-bone/50 border border-hairline-border flex items-start space-x-3 js-auth-item">
                <span className="material-symbols-outlined text-cobalt-electric text-[18px] mt-0.5">
                  verified_user
                </span>
                <div className="space-y-1">
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-black">
                    Enterprise Studio Seat?
                  </div>
                  <p className="font-sans text-xs text-graphite-muted leading-relaxed">
                    Multi-seat practices using Revit® or Rhino.Inside® live sync can
                    authenticate directly via domain-level SAML single sign-on.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Registration Callout */}
            <div className="border-t border-hairline-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs js-auth-item">
              <span className="font-sans text-graphite-muted">
                {mode === "signin"
                  ? "New to Illoca Architectural Studio?"
                  : "Already hold an active workstation license?"}
              </span>
              <button
                type="button"
                onClick={() => handleModeSwitch(mode === "signin" ? "signup" : "signin")}
                className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-black hover:text-cobalt-electric border-b border-dotted border-cadmium-vermilion pb-0.5 inline-flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <span>
                  {mode === "signin" ? "Request Studio Access" : "Return to Sign In"}
                </span>
                <span className="material-symbols-outlined text-[14px] text-cadmium-vermilion">
                  chevron_right
                </span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
