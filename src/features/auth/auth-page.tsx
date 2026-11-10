"use client";
import { BLUEPRINT_NODES } from "./data/blueprint-nodes";

import Link from "next/link";
import { Suspense } from "react";
import { useAuthPage } from "./use-auth";
import { SessionLoadingScreen } from "./loading-screen";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <SessionLoadingScreen
          title="Loading Account Access"
          subtitle="Initializing authentication runtime..."
        />
      }
    >
      <SignInPageInner />
    </Suspense>
  );
}

function SignInPageInner() {
  const {
    user,
    loading,
    destination,
    rootRef,
    blueprintFrameRef,
    svgRef,
    coordXRef,
    coordYRef,
    cursorPxRef,
    mode,
    stage,
    setStage,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    studioDomain,
    setStudioDomain,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    isSubmitting,
    isVerifyingOtp,
    activeNode,
    setActiveNode,
    layers,
    setLayers,
    notice,
    latency,
    otpDigits,
    setOtpDigits,
    resendCooldown,
    rateLimitActive,
    otpInputRefs,
    handleDigitChange,
    handleDigitKeyDown,
    handlePaste,
    handleResendOtp,
    handleOtpSubmit,
    handleModeSwitch,
    handleMouseMove,
    handleBlueprintTouchStart,
    handleBlueprintTouchMove,
    handleBlueprintTouchEnd,
    handleBlueprintLeave,
    handleFormSubmit,
    handleSignOut,
  } = useAuthPage();

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
                  <span className="text-cadmium-vermilion">{"//"}</span>
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
                  02 // Register
                </button>
              </div>
              <span className="font-mono text-[11px] tracking-widest uppercase text-cobalt-electric font-medium flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-cobalt-electric inline-block" />
                <span>READY</span>
              </span>
            </div>

            {/* Center Form Module */}
            <div className="my-auto py-8 w-full max-w-[420px] mx-auto">
              {/* Section Title */}
              <div className="mb-8 space-y-2 js-auth-item">
                <div className="inline-flex items-center space-x-2">
                  <span className="w-2 h-2 bg-cadmium-vermilion inline-block" />
                  <span className="font-mono text-[11px] uppercase tracking-widest text-graphite-muted">
                    {mode === "signin"
                      ? "AUTHENTICATION PORTAL"
                      : "ACCOUNT REGISTRATION"}
                  </span>
                </div>
                <h1 className="font-serif text-4xl sm:text-[42px] text-ink-black leading-[1.08] tracking-tight">
                  {mode === "signin"
                    ? "Sign in to your studio."
                    : "Create your BuildGen account."}
                </h1>
                <p className="font-mono text-[11px] tracking-wider text-graphite-muted uppercase pt-1">
                  BUILDGEN &mdash; ACCOUNT ACCESS
                </p>
              </div>

              {user && (
                <div className="mb-5 p-3 border font-sans text-sm">
                  <p>Signed in as {user.email}.</p>
                  <Link href={destination}>Continue to workspace</Link>{" / "}
                  <button type="button" onClick={handleSignOut} disabled={loading}>Sign out</button>
                </div>
              )}

              {/* Status Banner if Active */}
              {notice.type !== "idle" && (
                <div
                  role={notice.type === "error" ? "alert" : "status"}
                  aria-live="polite"
                  className={`mb-5 p-3 border font-mono text-[11px] flex items-center space-x-2.5 ${
                    notice.type === "error"
                      ? "bg-cadmium-vermilion/10 border-cadmium-vermilion text-cadmium-vermilion"
                      : notice.type === "success"
                      ? "bg-cobalt-electric/10 border-cobalt-electric text-cobalt-electric"
                      : "bg-surface-bone border-ink-black text-ink-black"
                  }`}
                >
                  <span className="w-2 h-2 bg-current animate-ping shrink-0" />
                  <span>{notice.message}</span>
                </div>
              )}

              {/* Authentication Form / OTP Module */}
              {stage === "credentials" ? (
                <>
                  <form onSubmit={handleFormSubmit} aria-busy={isSubmitting} className="space-y-5">
                    <fieldset disabled={isSubmitting || loading} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }} className="space-y-5">
                    {mode === "signup" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="fullName"
                              className="font-mono text-[11px] uppercase tracking-wider text-ink-black font-semibold"
                            >
                              Full name
                            </label>
                            <span className="font-mono text-[9px] text-pencil-gray">00A</span>
                          </div>
                          <div className="relative">
                            <input
                              id="fullName"
                              type="text"
                              autoComplete="name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="name"
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
                              Organization (optional)
                            </label>
                            <span className="font-mono text-[9px] text-pencil-gray">00B</span>
                          </div>
                          <div className="relative">
                            <input
                              id="studioDomain"
                              type="text"
                              autoComplete="organization"
                              value={studioDomain}
                              onChange={(e) => setStudioDomain(e.target.value)}
                              placeholder="CYAN/DRAFT STUDIO"
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
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="email"
                          className="w-full h-12 px-4 bg-paper-white border border-hairline-border-strong text-ink-black font-sans text-sm placeholder:text-pencil-gray focus:outline-none focus:border-cobalt-electric focus:ring-0 transition-colors"
                        />
                        <div className="w-1.5 h-1.5 bg-hairline-border-strong group-focus-within:bg-cobalt-electric absolute top-1.5 right-1.5 pointer-events-none transition-colors" />
                      </div>
                    </div>

                    {/* Input 02: Password */}
                    <div className="space-y-2 js-auth-item">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="font-mono text-[11px] uppercase tracking-wider text-ink-black font-semibold"
                        >
                          Password
                        </label>
                      </div>
                      <div className="relative group">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete={mode === "signup" ? "new-password" : "current-password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="password"
                          className="w-full h-12 px-4 pr-11 bg-paper-white border border-hairline-border-strong text-ink-black font-sans text-sm placeholder:text-pencil-gray focus:outline-none focus:border-cobalt-electric focus:ring-0 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowPassword((prev) => !prev);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-graphite-muted hover:text-ink-black hover:bg-surface-bone/80 rounded transition-colors cursor-pointer z-10 focus:outline-none"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4 text-ink-black"
                            >
                              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                              <line x1="2" y1="2" x2="22" y2="22" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4 text-graphite-muted hover:text-ink-black"
                            >
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Workstation Persistence Option */}
                    {mode === "signin" && (
                      <div className="flex items-center justify-between pt-1 js-auth-item">
                        <label className="inline-flex items-center space-x-2.5 cursor-pointer select-none group">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 bg-paper-white border border-hairline-border-strong text-cobalt-electric focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="font-sans text-xs text-graphite-muted group-hover:text-ink-black transition-colors">
                            Keep me signed in on this device (up to 30 days)
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Primary Action Button */}
                    <div className="pt-2 js-auth-item">
                      <button
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="tactile-btn w-full h-12 bg-cobalt-electric hover:bg-[#2F50B0] text-paper-white border border-ink-black flex items-center justify-between px-5 group cursor-pointer"
                      >
                        <span className="font-mono text-xs font-semibold uppercase tracking-widest">
                          {isSubmitting
                            ? "Please wait..."
                            : mode === "signin"
                            ? "Continue"
                            : "Request Seat"}
                        </span>
                        <div className="w-7 h-7 bg-cadmium-vermilion border border-ink-black flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                          <span className="material-symbols-outlined text-paper-white text-[16px]">
                            arrow_forward
                          </span>
                        </div>
                      </button>
                    </div>
                    </fieldset>
                  </form>
                </>
              ) : (
                /* STAGE 2: SUPABASE OTP VERIFICATION */
                <div className="space-y-5 animate-in fade-in duration-200">
                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-ink-black font-semibold">
                          6-Digit Authorization Code
                        </label>
                        <span className="font-mono text-[9px] text-pencil-gray">SECURITY CODE</span>
                      </div>

                      {/* Explicit 6-Column Grid Layout */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(6, 1fr)",
                          gap: "8px",
                          maxWidth: "280px",
                          margin: "0 auto",
                        }}
                      >
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <input
                            key={index}
                            ref={(el) => {
                              otpInputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={otpDigits[index]}
                            onChange={(e) => handleDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handleDigitKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            style={{
                              width: "100%",
                              height: "44px",
                              boxSizing: "border-box",
                              padding: "0",
                            }}
                            className="bg-paper-white border border-hairline-border-strong text-ink-black font-mono text-center text-lg font-bold focus:outline-none focus:border-cobalt-electric focus:ring-0 transition-colors"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isVerifyingOtp}
                        className="tactile-btn w-full h-11 bg-cobalt-electric hover:bg-[#2F50B0] text-paper-white border border-ink-black flex items-center justify-between px-5 group cursor-pointer disabled:opacity-60"
                      >
                        <span className="font-mono text-xs font-semibold uppercase tracking-widest">
                          {isVerifyingOtp ? "VERIFYING TOKEN..." : "Verify & Launch Studio"}
                        </span>
                        <div className="w-6 h-6 bg-cadmium-vermilion border border-ink-black flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                          <span className="material-symbols-outlined text-paper-white text-[15px]">
                            lock_open
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Dedicated Resend OTP Action Button */}
                    <div className="pt-1">
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || isVerifyingOtp}
                        onClick={handleResendOtp}
                        className={`w-full h-10 border flex items-center justify-center space-x-2 px-4 font-mono text-[11px] font-semibold uppercase tracking-wider transition-all ${
                          resendCooldown > 0
                            ? "bg-surface-bone/40 text-pencil-gray border-hairline-border cursor-not-allowed"
                            : "bg-surface-bone/80 hover:bg-surface-bone text-ink-black border-hairline-border-strong hover:border-ink-black cursor-pointer shadow-2xs active:translate-y-px"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`w-3.5 h-3.5 ${
                            resendCooldown > 0 ? "text-pencil-gray" : "text-ink-black"
                          }`}
                        >
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                          <path d="M16 21h5v-5" />
                        </svg>
                        <span>
                          {resendCooldown > 0
                            ? `Resend OTP in ${resendCooldown}s`
                            : "Resend OTP"}
                        </span>
                      </button>
                    </div>

                    {/* Secondary Navigation: Return to Credentials */}
                    <div className="flex items-center justify-center pt-1 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          setStage("credentials");
                        }}
                        className="text-graphite-muted hover:text-ink-black uppercase tracking-wider underline decoration-dotted transition-colors cursor-pointer text-[10px]"
                      >
                        Return to Credentials
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Bottom Registration Callout */}
            <div className="border-t border-hairline-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs js-auth-item">
              <span className="font-sans text-graphite-muted">
                {stage === "otp"
                  ? "Awaiting Supabase authorization code..."
                  : mode === "signin"
                  ? "New to BuildGen?"
                  : "Already registered?"}
              </span>
              {stage === "otp" ? (
                <button
                  type="button"
                  onClick={() => {
                    setStage("credentials");
                  }}
                  className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-black hover:text-cobalt-electric border-b border-dotted border-cadmium-vermilion pb-0.5 inline-flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <span>Cancel OTP & Return</span>
                  <span className="material-symbols-outlined text-[14px] text-cadmium-vermilion">
                    chevron_right
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleModeSwitch(mode === "signin" ? "signup" : "signin")}
                  className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-black hover:text-cobalt-electric border-b border-dotted border-cadmium-vermilion pb-0.5 inline-flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <span>
                    {mode === "signin" ? "Create an Account" : "Return to Sign In"}
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-cadmium-vermilion">
                    chevron_right
                  </span>
                </button>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );

}
