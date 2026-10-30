"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";

type ViewportMode = "2d" | "3d" | "section" | "sun" | "split";
type DraftingTool =
  | "select"
  | "pan"
  | "wall-ext"
  | "wall-int"
  | "door-pocket"
  | "glaze-slide"
  | "column"
  | "dimension";

interface InspectedEntity {
  id: string;
  title: string;
  badge: string;
  level: string;
  area: string;
  structure: string;
  shading: string;
}

interface CopilotMessage {
  id: string;
  role: "user" | "ai";
  timestamp: string;
  text: string;
  metrics?: {
    span: string;
    solar: string;
    gfa: string;
  };
}

interface PlacedStamp {
  id: string;
  type: DraftingTool;
  x: number;
  y: number;
  label: string;
}

const ENTITIES: Record<string, InspectedEntity> = {
  terrace: {
    id: "#ENT-9042",
    title: "East Terrace Extension Module",
    badge: "PROPOSED DIFF",
    level: "Level 01 → Roof",
    area: "+19.2 m²",
    structure: "Glulam + Steel",
    shading: "Timber Louver (150mm)",
  },
  living: {
    id: "#ENT-1040",
    title: "Living & Dining Pavilion",
    badge: "PRIMARY CORE",
    level: "Level 01 (+450mm)",
    area: "68.5 m²",
    structure: "RC Shear + Steel",
    shading: "South Glazed Curtain",
  },
  master: {
    id: "#ENT-1018",
    title: "Master Suite Volume",
    badge: "WEST WING",
    level: "Level 01 (+450mm)",
    area: "42.4 m²",
    structure: "300mm Limestone Cavity",
    shading: "Deep Reveal Louvers",
  },
  courtyard: {
    id: "#ENT-2004",
    title: "Central Open Courtyard",
    badge: "ATRIUM VOID",
    level: "Datum 0.00m",
    area: "38.0 m²",
    structure: "Permeable Travertine",
    shading: "Open Sky Aperture",
  },
  bath: {
    id: "#ENT-1022",
    title: "Wet Core & Bath Suite",
    badge: "MEP CORE",
    level: "Level 01 (+450mm)",
    area: "14.8 m²",
    structure: "150mm Acoustic Partition",
    shading: "Clerestory North Slot",
  },
};

const PROJECT_NAMES: Record<string, { name: string; code: string }> = {
  "villa-sognate": { name: "Villa Sognate", code: "VS-049" },
  "nordic-horizon": { name: "Nordic Horizon Mixed-Use", code: "NH-112" },
  "atelier-pavilion": { name: "Atelier Pavilion", code: "AP-088" },
  "kyoto-townhome": { name: "Kyoto Urban Townhome", code: "KT-204" },
  "aero-industrial": { name: "Aero Industrial Park Hub", code: "AI-501" },
};

function StudioCanvasInner() {
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();

  const projectSlug = searchParams.get("project") || "villa-sognate";
  const initialModeParam = searchParams.get("mode");
  const projectMeta = PROJECT_NAMES[projectSlug] || {
    name: projectSlug
      .replace(/-[0-9]{2}-[a-z0-9]{4}$/i, "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    code: "SP-106",
  };

  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sheet2dRef = useRef<HTMLDivElement>(null);
  const svg3dRef = useRef<SVGSVGElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const cursorReadoutRef = useRef<HTMLDivElement>(null);
  const cursorMmRef = useRef<{ x: number; y: number }>({ x: 14280, y: 8640 });

  const [viewportMode, setViewportMode] = useState<ViewportMode>(
    initialModeParam === "3d" ? "3d" : "2d"
  );
  const [activeTool, setActiveTool] = useState<DraftingTool>("select");
  const [activePipeline, setActivePipeline] = useState<string>("Drafting");
  const [selectedEntityKey, setSelectedEntityKey] = useState<string>("terrace");

  // Parametric 3D & Drafting Controls
  const [extrusionHeight, setExtrusionHeight] = useState<number>(3200);
  const [slabThickness, setSlabThickness] = useState<number>(300);
  const [sectionCut, setSectionCut] = useState<boolean>(false);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [sunShadows, setSunShadows] = useState<boolean>(true);
  const [shadowAngle, setShadowAngle] = useState<number>(135);
  const [louverDensity, setLouverDensity] = useState<number>(6);
  const [diffStatus, setDiffStatus] = useState<"proposed" | "committed" | "discarded">(
    "proposed"
  );
  const [isolateDiff, setIsolateDiff] = useState<boolean>(false);

  // Pan & Zoom State
  const [zoom, setZoom] = useState<number>(100);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  const [placedStamps, setPlacedStamps] = useState<PlacedStamp[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Copilot Chat State
  const [promptInput, setPromptInput] = useState<string>("");
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "msg-1",
      role: "user",
      timestamp: "14:22",
      text: "Extend the eastern living room wall by 2.4m to create an indoor-outdoor dining terrace with sliding glazed pockets, and extrude the 3D massing at 3,200mm ceiling height with a Summer Solstice sun shadow study.",
    },
    {
      id: "msg-2",
      role: "ai",
      timestamp: "SYNTHESIS COMPLETE // 1.4s",
      text: "Generated cantilevered East Terrace Extension (+19.2 m²) with 4-panel pocket glazing, 150mm timber louver brise-soleil, and structural steel edge beam aligned to Grid Axis D.",
      metrics: {
        span: "2,400 mm [PASS]",
        solar: "-38% kWh/m²",
        gfa: "124.9 m² (+19.2)",
      },
    },
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3600);
  };

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".js-studio-top",
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.04 }
      );
      tl.fromTo(
        ".js-studio-left",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.55, stagger: 0.03 },
        "-=0.35"
      );
      tl.fromTo(
        ".js-studio-canvas",
        { scale: 0.96, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: "expo.out" },
        "-=0.4"
      );
      tl.fromTo(
        ".js-studio-right",
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.55, stagger: 0.04 },
        "-=0.5"
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Animate viewport mode transition
  useEffect(() => {
    if (viewportMode === "section") {
      setSectionCut(true);
    } else if (viewportMode === "sun") {
      setSunShadows(true);
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".js-viewport-stage",
        { opacity: 0.25, scale: 0.97, y: 12 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "expo.out" }
      );

      // Animate SVG stroke drawing in 3D mode
      const strokes = gsap.utils.toArray<SVGGeometryElement>(".js-3d-wire");
      strokes.forEach((el) => {
        const len = el.getTotalLength ? el.getTotalLength() : 600;
        gsap.fromTo(
          el,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 0.95, ease: "power2.out" }
        );
      });
    }, viewportRef);

    return () => ctx.revert();
  }, [viewportMode]);

  // Parametric Extrusion Height + Shadow Angle + Section Cut GSAP Updates
  useEffect(() => {
    if (!svg3dRef.current) return;
    // Scale vertical offset based on extrusionHeight (default 3200 -> 0 offset)
    const deltaY = ((3200 - extrusionHeight) / 1000) * 32;
    gsap.to(".js-extrude-roof", {
      y: deltaY,
      duration: 0.35,
      ease: "power2.out",
    });

    // Shadow angle displacement
    const rad = (shadowAngle * Math.PI) / 180;
    const shadowShiftX = Math.cos(rad) * 18;
    const shadowShiftY = Math.sin(rad) * 12;
    gsap.to("#cast-shadows", {
      x: shadowShiftX,
      y: shadowShiftY,
      opacity: sunShadows ? 0.85 : 0,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [extrusionHeight, shadowAngle, sunShadows, viewportMode]);

  // Mouse move inside center viewport: live mm telemetry + 3D parallax + drag pan
  const handleViewportMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const vp = viewportRef.current as
      | (HTMLDivElement & {
          _rect?: DOMRect;
          _targets?: NodeListOf<Element>;
        })
      | null;
    if (!vp) return;
    const rect = vp._rect || (vp._rect = vp.getBoundingClientRect());
    const relX = (e.clientX - rect.left) / Math.max(rect.width, 1);
    const relY = (e.clientY - rect.top) / Math.max(rect.height, 1);

    const mmX = Math.round(relX * 24000);
    const mmY = Math.round(relY * 16500);
    cursorMmRef.current = { x: mmX, y: mmY };
    if (cursorReadoutRef.current) {
      cursorReadoutRef.current.textContent = `X: ${(mmX / 1000).toFixed(2)}m // Y: ${(
        mmY / 1000
      ).toFixed(2)}m // Z: ${(extrusionHeight / 1000).toFixed(2)}m`;
    }

    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
      return;
    }

    // Subtle 3D tilt on the active stage (cached DOM targets + 0ms latency)
    const tiltX = (relY - 0.5) * -5;
    const tiltY = (relX - 0.5) * 5;
    const targets = vp._targets || (vp._targets = vp.querySelectorAll(".js-tilt-target"));
    if (targets.length) {
      gsap.to(targets, {
        rotateX: tiltX,
        rotateY: tiltY,
        duration: 0.18,
        ease: "expo.out",
        overwrite: "auto",
        force3D: true,
        transformPerspective: 1200,
      });
    }
  };

  const handleViewportMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "pan" || e.button === 1 || e.shiftKey) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleViewportMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetCamera = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
    setIsolateDiff(false);
    gsap.to(".js-tilt-target", {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.6,
      ease: "expo.out",
    });
    triggerToast("CAMERA & ORTHOGRAPHIC MATRIX RESET // SCALE 1:100");
  };

  // Click on 2D sheet to place stamp when a drafting tool is active
  const handleSheetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "select" || activeTool === "pan") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const toolLabels: Record<DraftingTool, string> = {
      select: "",
      pan: "",
      "wall-ext": "EXT CAVITY 300mm",
      "wall-int": "INT PARTITION 150mm",
      "door-pocket": "POCKET DOOR 900mm",
      "glaze-slide": "SLIDING GLAZE 2400mm",
      column: "COL 300×300",
      dimension: "DIM 2,400mm",
    };

    const newStamp: PlacedStamp = {
      id: `stamp-${Date.now()}`,
      type: activeTool,
      x,
      y,
      label: toolLabels[activeTool],
    };

    setPlacedStamps((prev) => [...prev, newStamp]);
    triggerToast(
      `PLACED [${toolLabels[activeTool]}] AT (${cursorMmRef.current.x}, ${cursorMmRef.current.y}mm)`
    );
  };

  // Submit AI Copilot prompt or quick chip
  const handleSendPrompt = (customText?: string) => {
    const text = (customText ?? promptInput).trim();
    if (!text || isSynthesizing) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setPromptInput("");
    setIsSynthesizing(true);

    // Apply live geometric changes matching the prompt
    const lower = text.toLowerCase();
    setTimeout(() => {
      let responseText =
        "Updated parametric BIM topology and recalculated cantilever load paths along Grid Axis D.";
      let metrics = {
        span: "2,400 mm [PASS]",
        solar: "-41% kWh/m²",
        gfa: "124.9 m² (+19.2)",
      };

      if (lower.includes("louver") || lower.includes("pergola")) {
        setLouverDensity(10);
        setDiffStatus("proposed");
        responseText =
          "Increased timber pergola louver density to 10 blades @ 120mm pitch. Peak summer solar gain reduced by an additional 9.4%.";
        metrics = {
          span: "2,400 mm [PASS]",
          solar: "-47% kWh/m²",
          gfa: "124.9 m² (+19.2)",
        };
      } else if (lower.includes("sun") || lower.includes("solstice")) {
        setViewportMode("3d");
        setSunShadows(true);
        setShadowAngle(165);
        responseText =
          "Executed Summer Solstice (June 21, 14:00) solar altitude simulation. Cast shadow vectors updated across East Terrace plinth.";
      } else if (lower.includes("facade") || lower.includes("level 02") || lower.includes("extrude")) {
        setViewportMode("3d");
        setExtrusionHeight(3600);
        responseText =
          "Aligned East Facade datum with Level 02 (+3,600mm) and synchronized glulam edge beam elevation.";
        metrics = {
          span: "2,400 mm [PASS]",
          solar: "-40% kWh/m²",
          gfa: "128.4 m² (+22.7)",
        };
      }

      const aiMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        timestamp: "SYNTHESIS COMPLETE // 0.9s",
        text: responseText,
        metrics,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsSynthesizing(false);

      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 60);
    }, 650);
  };

  const inspected = ENTITIES[selectedEntityKey] || ENTITIES.terrace;

  return (
    <div
      ref={rootRef}
      className="tactile-editorial-root bg-surface-canvas text-ink-black font-sans antialiased overflow-hidden select-none h-screen w-screen flex flex-col"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[80] bg-ink-black text-paper-white border border-cobalt-electric px-4 py-2.5 shadow-[4px_4px_0px_#EC633D] flex items-center space-x-3 font-mono text-xs">
          <span className="w-2 h-2 bg-cadmium-vermilion animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP APPLICATION BAR */}
      <header className="h-14 w-full bg-[#FDF8F0] border-b border-[#212121]/15 px-5 flex items-center justify-between z-40 shrink-0">
        {/* Left: Brand Identity & Project Context + Viewport Switcher */}
        <div className="flex items-center space-x-5 js-studio-top">
          <div className="flex items-center space-x-2.5">
            <Link
              href="/dashboard"
              className="w-6 h-6 bg-cobalt-electric flex items-center justify-center border border-ink-black hover:bg-cadmium-vermilion transition-colors"
              title="Back to Architectural Projects"
            >
              <div className="w-2.5 h-2.5 border border-paper-white" />
            </Link>
            <Link
              href="/"
              className="font-mono font-bold text-sm tracking-tight text-ink-black"
            >
              ILLOCA
            </Link>
            <span className="font-mono text-xs text-pencil-gray">/</span>
            <Link
              href="/dashboard"
              className="font-mono text-xs text-graphite-muted hover:text-ink-black transition-colors"
            >
              {projectMeta.code}
            </Link>
            <span className="font-mono text-xs text-pencil-gray">/</span>
            <span className="font-serif italic text-base text-ink-black">
              {projectMeta.name}
            </span>
          </div>

          <div className="h-4 w-px bg-[#212121]/15" />

          {/* Viewport Switcher: 2D PLAN / 3D AXO / SECTION / SUN/SHADOW / SPLIT */}
          <nav className="flex items-center bg-surface-bone p-0.5 border border-[#212121]/20">
            {(
              [
                { id: "2d", label: "2D PLAN" },
                { id: "3d", label: "3D AXO" },
                { id: "section", label: "SECTION" },
                { id: "sun", label: "SUN/SHADOW" },
                { id: "split", label: "SPLIT 2D/3D" },
              ] as const
            ).map((mode) => {
              const active = viewportMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setViewportMode(mode.id)}
                  className={`px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer ${
                    active
                      ? "bg-cobalt-electric text-paper-white font-semibold shadow-[1px_1px_0px_#212121]"
                      : "text-[#5B5B5B] hover:text-[#212121]"
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Live Scale, Snap & Coordinate Telemetry */}
        <div className="hidden xl:flex items-center space-x-6 font-mono text-[11px] text-graphite-muted js-studio-top">
          <div className="flex items-center space-x-1.5">
            <span className="text-pencil-gray">SCALE</span>
            <span className="text-ink-black font-medium bg-surface-bone px-1.5 py-0.5 border border-[#212121]/15">
              1 : 100
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-pencil-gray">GRID</span>
            <span className="text-ink-black font-medium">1,000mm</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 bg-cobalt-electric inline-block" />
            <span className="text-ink-black">ORTHO SNAP: ON</span>
          </div>
          <div ref={cursorReadoutRef} className="tabular-nums text-ink-black">
            X: 14.28m // Y: 8.64m // Z: {(extrusionHeight / 1000).toFixed(2)}m
          </div>
        </div>

        {/* Right: Utility & Export Actions */}
        <div className="flex items-center space-x-2.5 js-studio-top">
          <div className="flex items-center border border-[#212121]/20 bg-surface-bone/50">
            <button
              type="button"
              onClick={() => {
                setPlacedStamps((prev) => prev.slice(0, -1));
                triggerToast("UNDO LAST OPERATION");
              }}
              className="w-8 h-8 flex items-center justify-center text-[#5B5B5B] hover:text-[#212121] hover:bg-surface-bone border-r border-[#212121]/15 cursor-pointer"
              title="Undo (⌘Z)"
            >
              <span className="material-symbols-outlined text-[16px]">undo</span>
            </button>
            <button
              type="button"
              onClick={handleResetCamera}
              className="w-8 h-8 flex items-center justify-center text-[#5B5B5B] hover:text-[#212121] hover:bg-surface-bone cursor-pointer"
              title="Reset Camera (R)"
            >
              <span className="material-symbols-outlined text-[16px]">
                center_focus_strong
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              triggerToast(
                `EXPORTING ${projectMeta.name.toUpperCase()} // IFC 4.3 + DWG BUNDLE READY`
              )
            }
            className="h-8 px-3 bg-surface-bone border border-[#212121]/30 font-mono text-[11px] uppercase tracking-wider text-ink-black hover:bg-ink-black hover:text-paper-white transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">ios_share</span>
            <span>Export IFC</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDiffStatus("committed");
              triggerToast("AI DIFF COMMITTED TO MASTER BIM REPOSITORY [REV.5]");
            }}
            className="h-8 px-3.5 bg-cobalt-electric text-paper-white border border-ink-black font-mono text-[11px] uppercase tracking-wider font-medium flex items-center space-x-2 shadow-[2px_2px_0px_#212121] hover:bg-cadmium-vermilion transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 bg-cadmium-vermilion border border-paper-white" />
            <span>Commit AI</span>
          </button>

          <Link
            href="/sign-in"
            className="w-8 h-8 bg-ink-black text-paper-white font-mono text-xs font-semibold flex items-center justify-center border border-ink-black ml-1"
            title={currentUser?.name || "Architect Workstation"}
          >
            {currentUser?.avatar || "AR"}
          </Link>
        </div>
      </header>

      {/* MAIN STUDIO WORKSPACE (3-COLUMN CAD LAYOUT) */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANEL: Direct Drafting Tools + 3D Projection Matrix (300px) */}
        <aside className="w-[300px] bg-[#EAE0CE] border-r border-[#212121]/15 flex flex-col justify-between z-30 shrink-0 overflow-y-auto">
          <div>
            {/* Workspace Identification */}
            <div className="p-3.5 border-b border-[#212121]/15 flex items-center justify-between bg-[#FDF8F0]/50 js-studio-left">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#5B5B5B]">
                  WORKSPACE 01 // ARCH-504
                </div>
                <div className="font-serif italic text-base text-[#212121]">
                  {projectMeta.name} — Level 01
                </div>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#EC633D]/15 text-[#EC633D] border border-[#EC633D]/30 font-semibold">
                1,000 CR
              </span>
            </div>

            {/* Primary Synthesis Action */}
            <div className="p-3 border-b border-[#212121]/15 js-studio-left">
              <button
                type="button"
                onClick={() =>
                  handleSendPrompt(
                    "Synthesize structural BIM massing and optimize southern solar louver pitch."
                  )
                }
                className="w-full h-9 bg-cobalt-electric text-paper-white font-mono text-xs uppercase tracking-wider font-medium flex items-center justify-center space-x-2 border border-ink-black shadow-[2px_2px_0px_#212121] hover:bg-cadmium-vermilion transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  auto_awesome
                </span>
                <span>Synthesize BIM</span>
              </button>
            </div>

            {/* Active Geometry & Direct Drafting Tools */}
            <div className="p-3 border-b border-[#212121]/15 js-studio-left">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#5B5B5B] font-semibold">
                  ACTIVE GEOMETRY TOOLS
                </span>
                <span className="font-mono text-[9px] text-[#3B60C5]">
                  CLICK CANVAS TO PLACE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  {
                    id: "select" as DraftingTool,
                    code: "00",
                    label: "Select / Inspect",
                    sub: "Entity Cursor [V]",
                    icon: "near_me",
                  },
                  {
                    id: "pan" as DraftingTool,
                    code: "00",
                    label: "Pan Sheet",
                    sub: "Hand Drag [H]",
                    icon: "pan_tool",
                  },
                  {
                    id: "wall-ext" as DraftingTool,
                    code: "01",
                    label: "Exterior Cavity",
                    sub: "300mm RC + Insul",
                    icon: "wall_lamp",
                  },
                  {
                    id: "wall-int" as DraftingTool,
                    code: "02",
                    label: "Interior Wall",
                    sub: "150mm Timber Stud",
                    icon: "vertical_split",
                  },
                  {
                    id: "door-pocket" as DraftingTool,
                    code: "03",
                    label: "Pocket Door",
                    sub: "900mm Single Leaf",
                    icon: "door_front",
                  },
                  {
                    id: "glaze-slide" as DraftingTool,
                    code: "04",
                    label: "Sliding Glaze",
                    sub: "2,400mm Triple Pane",
                    icon: "window",
                  },
                ].map((tool) => {
                  const active = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => setActiveTool(tool.id)}
                      className={`p-2 border text-left transition-all cursor-pointer ${
                        active
                          ? "bg-[#FDF8F0] border-[#3B60C5] shadow-[2px_2px_0px_#3B60C5]"
                          : "bg-[#FDF8F0]/60 border-[#212121]/15 hover:bg-[#FDF8F0]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-[9px] font-bold ${
                            active ? "text-[#3B60C5]" : "text-[#9C9C9C]"
                          }`}
                        >
                          [{tool.code}]
                        </span>
                        <span
                          className={`material-symbols-outlined text-[15px] ${
                            active ? "text-[#EC633D]" : "text-[#5B5B5B]"
                          }`}
                        >
                          {tool.icon}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] font-semibold text-[#212121] mt-1 truncate">
                        {tool.label}
                      </div>
                      <div className="font-mono text-[9px] text-[#5B5B5B] truncate">
                        {tool.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3D Projection Matrix & Live Parametric Sliders */}
            <div className="p-3.5 border-b border-[#212121]/15 space-y-3 bg-[#FDF8F0]/40 js-studio-left">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#212121] font-semibold">
                  3D PROJECTION MATRIX
                </span>
                <span className="font-mono text-[10px] text-[#3B60C5]">
                  ISO 30° / 60°
                </span>
              </div>

              {/* Extrusion Height Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-[#5B5B5B]">Extrusion Height</span>
                  <span className="text-[#212121] font-semibold">
                    {extrusionHeight.toLocaleString()} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={2200}
                  max={4200}
                  step={100}
                  value={extrusionHeight}
                  onChange={(e) => setExtrusionHeight(Number(e.target.value))}
                  className="w-full accent-[#3B60C5] cursor-pointer h-1.5 bg-[#212121]/20"
                />
              </div>

              {/* Slab Thickness Selector */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-[#5B5B5B]">Slab Thickness</span>
                  <span className="text-[#212121] font-semibold">
                    {slabThickness} mm
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
                  {[150, 300, 450].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSlabThickness(val)}
                      className={`py-1 border cursor-pointer ${
                        slabThickness === val
                          ? "bg-[#3B60C5] text-[#FFFBF3] border-[#212121] font-semibold"
                          : "bg-[#FDF8F0] text-[#5B5B5B] border-[#212121]/20"
                      }`}
                    >
                      {val}mm
                    </button>
                  ))}
                </div>
              </div>

              {/* Sun / Shadow Azimuth Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-[#5B5B5B]">Sun Azimuth Angle</span>
                  <span className="text-[#EC633D] font-semibold">
                    {shadowAngle}° SE
                  </span>
                </div>
                <input
                  type="range"
                  min={45}
                  max={260}
                  step={5}
                  value={shadowAngle}
                  onChange={(e) => setShadowAngle(Number(e.target.value))}
                  className="w-full accent-[#EC633D] cursor-pointer h-1.5 bg-[#212121]/20"
                />
              </div>

              {/* Section Cut & Wireframe Toggles */}
              <div className="pt-1 space-y-1.5">
                <label className="flex items-center justify-between font-mono text-[11px] cursor-pointer">
                  <span className="text-[#5B5B5B]">1,400mm Section Cut</span>
                  <input
                    type="checkbox"
                    checked={sectionCut}
                    onChange={(e) => setSectionCut(e.target.checked)}
                    className="accent-[#EC633D] w-3.5 h-3.5"
                  />
                </label>
                <label className="flex items-center justify-between font-mono text-[11px] cursor-pointer">
                  <span className="text-[#5B5B5B]">X-Ray Wireframe Overlay</span>
                  <input
                    type="checkbox"
                    checked={wireframeMode}
                    onChange={(e) => setWireframeMode(e.target.checked)}
                    className="accent-[#3B60C5] w-3.5 h-3.5"
                  />
                </label>
              </div>
            </div>

            {/* Studio Pipeline Layer Tabs */}
            <div className="p-2 space-y-0.5 js-studio-left">
              {[
                { id: "Drafting", icon: "architecture", count: "12" },
                { id: "Components", icon: "door_sliding", count: "28" },
                { id: "Assemblies", icon: "layers", count: "06" },
                { id: "Annotations", icon: "straighten", count: "44" },
                { id: "Structural", icon: "domain", count: "LOD 350" },
              ].map((item) => {
                const active = activePipeline === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActivePipeline(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                      active
                        ? "bg-[#FDF8F0] text-[#212121] font-semibold border-l-2 border-[#EC633D]"
                        : "text-[#5B5B5B] hover:bg-[#FDF8F0]/50 hover:text-[#212121]"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          active ? "text-[#3B60C5]" : ""
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.id}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#3B60C5]">
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Left Footer Links */}
          <div className="p-3 border-t border-[#212121]/15 bg-[#EAE0CE] font-mono text-[10px] text-[#5B5B5B] flex items-center justify-between">
            <Link
              href="/dashboard"
              className="hover:text-[#212121] flex items-center space-x-1"
            >
              <span className="material-symbols-outlined text-[14px]">
                arrow_back
              </span>
              <span>ALL PLOTS</span>
            </Link>
            <span>REVIT SYNC: LIVE</span>
          </div>
        </aside>

        {/* CENTER INTERACTIVE VIEWPORT: 2D FLOORPLAN / 3D AXONOMETRIC / SPLIT */}
        <section
          ref={viewportRef}
          onMouseMove={handleViewportMouseMove}
          onMouseDown={handleViewportMouseDown}
          onMouseUp={handleViewportMouseUp}
          onMouseLeave={handleViewportMouseUp}
          className={`flex-1 relative bg-[#FDF8F0] drafting-grid overflow-hidden flex items-center justify-center js-studio-canvas ${
            activeTool === "pan" || isDragging
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-crosshair"
          }`}
        >
          {/* TOP METRIC RULER */}
          <div className="absolute top-0 left-6 right-0 h-6 bg-[#EAE0CE]/90 border-b border-[#212121]/15 z-20 flex items-end px-8 font-mono text-[9px] text-[#5B5B5B] select-none pointer-events-none">
            {[
              "-5,000",
              "0.00",
              "5,000",
              "10,000",
              "15,000",
              "20,000",
              "25,000",
              "30,000",
            ].map((tick) => (
              <div
                key={tick}
                className="flex-1 border-l border-[#212121]/30 pl-1 pb-0.5"
              >
                {tick}
              </div>
            ))}
          </div>

          {/* LEFT METRIC RULER */}
          <div className="absolute top-6 bottom-0 left-0 w-6 bg-[#EAE0CE]/90 border-r border-[#212121]/15 z-20 flex flex-col justify-between py-8 font-mono text-[9px] text-[#5B5B5B] select-none pointer-events-none">
            {["0", "5k", "10k", "15k", "20k"].map((tick) => (
              <div
                key={tick}
                className="border-t border-[#212121]/30 pt-0.5 text-center"
              >
                {tick}
              </div>
            ))}
          </div>

          {/* Floating Viewport HUD Controls (Top-Left inside canvas) */}
          <div className="absolute top-10 left-10 z-20 flex items-center bg-[#FDF8F0]/95 border border-[#212121]/20 shadow-[2px_2px_0px_rgba(33,33,33,0.1)]">
            <button
              type="button"
              onClick={() => setViewportMode(viewportMode === "2d" ? "3d" : "2d")}
              className="p-2 bg-[#3B60C5] text-[#FFFBF3] border-r border-[#212121]/15 cursor-pointer"
              title="Toggle 2D Plan / 3D Axonometric"
            >
              <span className="material-symbols-outlined text-[18px] block">
                deployed_code
              </span>
            </button>
            <button
              type="button"
              onClick={() => setWireframeMode((w) => !w)}
              className={`p-2 border-r border-[#212121]/15 cursor-pointer ${
                wireframeMode
                  ? "bg-[#212121] text-[#FFFBF3]"
                  : "text-[#5B5B5B] hover:text-[#212121]"
              }`}
              title="Wireframe Mode"
            >
              <span className="material-symbols-outlined text-[18px] block">
                grid_4x4
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSectionCut((s) => !s)}
              className={`p-2 border-r border-[#212121]/15 cursor-pointer ${
                sectionCut
                  ? "bg-[#EC633D] text-[#FFFBF3]"
                  : "text-[#5B5B5B] hover:text-[#212121]"
              }`}
              title="Horizontal Section Cut (1,400mm)"
            >
              <span className="material-symbols-outlined text-[18px] block">
                content_cut
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSunShadows((s) => !s)}
              className={`p-2 border-r border-[#212121]/15 cursor-pointer ${
                sunShadows
                  ? "bg-[#EAE0CE] text-[#212121]"
                  : "text-[#5B5B5B] hover:text-[#212121]"
              }`}
              title="Toggle Sun Cast Hatching"
            >
              <span className="material-symbols-outlined text-[18px] block">
                wb_sunny
              </span>
            </button>
            <button
              type="button"
              onClick={handleResetCamera}
              className="p-2 text-[#5B5B5B] hover:text-[#212121] cursor-pointer"
              title="Reset Camera (R)"
            >
              <span className="material-symbols-outlined text-[18px] block">
                restart_alt
              </span>
            </button>
          </div>

          {/* Top-Right Orientation & World Matrix Gizmo */}
          <div className="absolute top-10 right-6 z-20 flex items-center space-x-3 pointer-events-none">
            <div className="bg-[#FDF8F0]/95 border border-[#212121]/20 px-3 py-2 font-mono text-[10px] space-y-0.5 shadow-[2px_2px_0px_rgba(33,33,33,0.08)]">
              <div className="text-[#5B5B5B] uppercase">GLOBAL WORLD MATRIX</div>
              <div className="text-[#212121] font-semibold">
                {viewportMode === "2d"
                  ? "ORTHOGRAPHIC PLAN // LEVEL 01"
                  : "ISOMETRIC 30° // +Z UP"}
              </div>
              <div className="text-[#3B60C5]">
                SOLAR AZIMUTH: {shadowAngle}° SE / ALT: 42°
              </div>
            </div>
            <div className="w-12 h-12 bg-[#FDF8F0]/95 border border-[#212121]/20 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 40 40">
                <line
                  x1="20"
                  y1="20"
                  x2="20"
                  y2="4"
                  stroke="#3B60C5"
                  strokeWidth="1.5"
                />
                <text
                  x="17"
                  y="3.5"
                  fontFamily="JetBrains Mono"
                  fontSize="6"
                  fill="#3B60C5"
                  fontWeight="bold"
                >
                  Z
                </text>
                <line
                  x1="20"
                  y1="20"
                  x2="34"
                  y2="28"
                  stroke="#EC633D"
                  strokeWidth="1.5"
                />
                <text
                  x="35"
                  y="31"
                  fontFamily="JetBrains Mono"
                  fontSize="6"
                  fill="#EC633D"
                  fontWeight="bold"
                >
                  X
                </text>
                <line
                  x1="20"
                  y1="20"
                  x2="6"
                  y2="28"
                  stroke="#212121"
                  strokeWidth="1.5"
                />
                <text
                  x="1"
                  y="31"
                  fontFamily="JetBrains Mono"
                  fontSize="6"
                  fill="#212121"
                  fontWeight="bold"
                >
                  Y
                </text>
                <circle cx="20" cy="20" r="2" fill="#212121" />
              </svg>
            </div>
          </div>

          {/* VIEWPORT STAGE CONTAINER (Supports 2D Plan, 3D Axo, or Split View) */}
          <div
            className={`js-viewport-stage w-full h-full flex items-center justify-center p-10 pt-16 pb-16 ${
              viewportMode === "split" ? "grid grid-cols-1 xl:grid-cols-2 gap-6" : ""
            }`}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
              transformOrigin: "center center",
            }}
          >
            {/* ================= 2D ORTHOGRAPHIC FLOORPLAN SHEET ================= */}
            {(viewportMode === "2d" || viewportMode === "split") && (
              <div
                ref={sheet2dRef}
                onClick={handleSheetClick}
                className="js-tilt-target relative w-full max-w-[820px] h-[540px] bg-[#FFFBF3] border border-[#212121] shadow-[8px_8px_0px_rgba(33,33,33,0.08)] p-8 flex flex-col justify-between mx-auto"
              >
                {/* Sheet Corner Registration Marks */}
                <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#212121]" />
                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-[#212121]" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-[#212121]" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#212121]" />

                {/* Sheet Top Header Info */}
                <div className="flex items-start justify-between border-b border-[#212121]/15 pb-3">
                  <div>
                    <div className="font-mono text-[10px] text-[#5B5B5B] uppercase tracking-widest">
                      PROJECT NO. ARC-2026-049 // SHEET A-101
                    </div>
                    <h1 className="font-serif text-xl text-[#212121] tracking-tight">
                      {projectMeta.name.toUpperCase()} &mdash; GROUND FLOOR PLAN
                      (LEVEL 01)
                    </h1>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right font-mono text-[10px]">
                      <div className="text-[#212121] font-semibold">
                        NORTH: 0.00° TRUE
                      </div>
                      <div className="text-[#5B5B5B]">DATUM: +14.20m MSL</div>
                    </div>
                    <div className="w-7 h-7 border border-[#212121] flex items-center justify-center">
                      <span className="font-mono text-[10px] font-bold">N↑</span>
                    </div>
                  </div>
                </div>

                {/* Central Floor Plan Geometry Area */}
                <div className="relative flex-1 my-4 flex items-center justify-center">
                  {/* Structural Grid Axes Labels */}
                  <div className="absolute top-0 left-16 right-24 flex justify-between font-mono text-[10px] text-[#5B5B5B] pointer-events-none">
                    {["A", "B", "C", "D"].map((axis) => (
                      <div key={axis} className="flex flex-col items-center">
                        <div className="w-5 h-5 border border-[#212121] bg-[#EAE0CE] flex items-center justify-center font-semibold text-[#212121]">
                          {axis}
                        </div>
                        <div className="h-80 w-px border-l border-dashed border-[#212121]/20" />
                      </div>
                    ))}
                  </div>

                  {/* Main Architectural Floor Plan Assembly */}
                  <div className="relative w-[640px] h-[320px] mt-4">
                    {/* West Wing: Master Suite */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntityKey("master");
                      }}
                      className={`absolute left-0 top-0 w-[210px] h-[195px] border-[3px] border-[#212121] p-3 flex flex-col justify-between cursor-pointer transition-all ${
                        selectedEntityKey === "master"
                          ? "bg-[#3B60C5]/15 ring-2 ring-[#3B60C5]"
                          : "bg-[#FDF8F0] hover:bg-[#EAE0CE]/40"
                      } ${isolateDiff ? "opacity-25" : ""}`}
                    >
                      <div className="flex justify-between items-start font-mono text-[9px] text-[#5B5B5B]">
                        <span>RM-101</span>
                        <span>+450mm</span>
                      </div>
                      <div className="text-center my-auto">
                        <div className="font-mono text-xs font-bold tracking-wider text-[#212121]">
                          MASTER SUITE
                        </div>
                        <div className="font-mono text-[10px] text-[#5B5B5B] border border-[#212121]/20 bg-[#EAE0CE]/60 inline-block px-1.5 mt-1">
                          42.4 m²
                        </div>
                      </div>
                      <div className="font-mono text-[9px] text-[#5B5B5B]">
                        FINISH: OAK PARQUET
                      </div>
                    </div>

                    {/* Southwest: Wet Core & Bath */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntityKey("bath");
                      }}
                      className={`absolute left-0 bottom-0 w-[210px] h-[128px] border-[3px] border-[#212121] p-3 flex flex-col justify-between cursor-pointer transition-all ${
                        selectedEntityKey === "bath"
                          ? "bg-[#3B60C5]/15 ring-2 ring-[#3B60C5]"
                          : "bg-[#EAE0CE]/40 hover:bg-[#EAE0CE]/70"
                      } ${isolateDiff ? "opacity-25" : ""}`}
                    >
                      <div className="font-mono text-[9px] text-[#5B5B5B]">
                        RM-102 // WET CORE
                      </div>
                      <div className="text-center">
                        <div className="font-mono text-xs font-bold text-[#212121]">
                          BATH SUITE
                        </div>
                        <div className="font-mono text-[10px] text-[#5B5B5B]">
                          14.8 m²
                        </div>
                      </div>
                      <div className="font-mono text-[8px] text-[#5B5B5B]">
                        TRAVERTINE SLAB
                      </div>
                    </div>

                    {/* Central Courtyard Void */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntityKey("courtyard");
                      }}
                      className={`absolute left-[207px] top-0 w-[165px] h-[165px] border-2 border-dashed border-[#212121]/60 p-3 flex flex-col justify-between cursor-pointer transition-all ${
                        selectedEntityKey === "courtyard"
                          ? "bg-[#3B60C5]/15 ring-2 ring-[#3B60C5]"
                          : "bg-[#EAE0CE]/25 hover:bg-[#EAE0CE]/50"
                      } ${isolateDiff ? "opacity-25" : ""}`}
                    >
                      <div className="font-mono text-[9px] text-[#5B5B5B]">
                        VOID // ATRIUM
                      </div>
                      <div className="text-center">
                        <div className="font-serif italic text-sm text-[#212121]">
                          Central Courtyard
                        </div>
                        <div className="font-mono text-[10px] text-[#5B5B5B]">
                          38.0 m² // +0.00m
                        </div>
                      </div>
                      <div className="font-mono text-[8px] text-[#3B60C5]">
                        DRAINAGE SLOPE 1.5%
                      </div>
                    </div>

                    {/* Primary Living & Dining Pavilion */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntityKey("living");
                      }}
                      className={`absolute left-[207px] bottom-0 w-[265px] h-[158px] border-[3px] border-[#212121] p-3 flex flex-col justify-between cursor-pointer transition-all ${
                        selectedEntityKey === "living"
                          ? "bg-[#3B60C5]/15 ring-2 ring-[#3B60C5]"
                          : "bg-[#FDF8F0] hover:bg-[#EAE0CE]/40"
                      } ${isolateDiff ? "opacity-25" : ""}`}
                    >
                      <div className="flex justify-between font-mono text-[9px] text-[#5B5B5B]">
                        <span>RM-104 // PAVILION</span>
                        <span>H: {extrusionHeight}mm</span>
                      </div>
                      <div className="text-center">
                        <div className="font-mono text-xs font-bold tracking-wider text-[#212121]">
                          LIVING &amp; DINING PAVILION
                        </div>
                        <div className="font-mono text-[10px] text-[#5B5B5B] border border-[#212121]/20 bg-[#EAE0CE]/60 inline-block px-1.5 mt-1">
                          68.5 m²
                        </div>
                      </div>
                      <div className="flex justify-between font-mono text-[9px] text-[#3B60C5]">
                        <span>GLULAM SPAN 8.2m</span>
                        <span>SOUTH GLAZING →</span>
                      </div>
                    </div>

                    {/* ACTIVE AI DIFF ZONE: Outdoor Dining Terrace Extension */}
                    {diffStatus !== "discarded" && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntityKey("terrace");
                        }}
                        className={`absolute left-[469px] bottom-0 w-[165px] h-[195px] border-2 p-3 flex flex-col justify-between cursor-pointer transition-all ${
                          diffStatus === "committed"
                            ? "border-[3px] border-[#212121] bg-[#FDF8F0]"
                            : "border-dashed border-[#3B60C5] bg-[#3B60C5]/10 shadow-[4px_4px_0px_rgba(59,96,197,0.18)]"
                        }`}
                      >
                        {/* Corner Transform Handles */}
                        <div className="w-2 h-2 bg-[#FFFBF3] border border-[#3B60C5] absolute -top-1 -left-1" />
                        <div className="w-2 h-2 bg-[#FFFBF3] border border-[#3B60C5] absolute -top-1 -right-1" />
                        <div className="w-2 h-2 bg-[#FFFBF3] border border-[#3B60C5] absolute -bottom-1 -left-1" />
                        <div className="w-2 h-2 bg-[#FFFBF3] border border-[#3B60C5] absolute -bottom-1 -right-1" />

                        {/* AI Proposal Badge */}
                        <div
                          className={`px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider inline-flex items-center space-x-1 self-start ${
                            diffStatus === "committed"
                              ? "bg-[#212121] text-[#FFFBF3]"
                              : "bg-[#3B60C5] text-[#FFFBF3]"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 bg-[#EC633D]" />
                          <span>
                            {diffStatus === "committed"
                              ? "COMMITTED [REV.5]"
                              : "PROPOSED DIFF: +19.2 m²"}
                          </span>
                        </div>

                        <div className="text-center my-auto">
                          <div className="font-mono text-[11px] font-bold text-[#3B60C5]">
                            OUTDOOR DINING TERRACE
                          </div>
                          <div className="font-mono text-[9px] text-[#212121] mt-0.5">
                            +2,400mm CANTILEVER
                          </div>
                          <div className="font-mono text-[9px] text-[#EC633D] mt-0.5">
                            {louverDensity} TIMBER LOUVERS
                          </div>
                        </div>

                        <div className="font-mono text-[8px] text-[#3B60C5] border-t border-[#3B60C5]/30 pt-1 flex justify-between">
                          <span>SLIDING GLAZE</span>
                          <span>PASS</span>
                        </div>
                      </div>
                    )}

                    {/* User-Placed Drafting Stamps */}
                    {placedStamps.map((stamp) => (
                      <div
                        key={stamp.id}
                        style={{ left: `${stamp.x}%`, top: `${stamp.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 bg-[#EC633D] text-[#FFFBF3] border border-[#212121] px-2 py-0.5 font-mono text-[9px] whitespace-nowrap shadow-[2px_2px_0px_#212121] z-20"
                      >
                        {stamp.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sheet Bottom Title Block & Dimension String */}
                <div className="border-t border-[#212121]/20 pt-2.5 flex items-center justify-between font-mono text-[10px] text-[#5B5B5B]">
                  <div className="flex items-center space-x-4">
                    <span className="text-[#212121] font-semibold">
                      TOTAL GFA: 163.7 m²{" "}
                      {diffStatus !== "discarded" ? "(+19.2 m² TERRACE)" : ""}
                    </span>
                    <span>WALL ASSEMBLY: {slabThickness}mm COMPOSITE</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 bg-[#EAE0CE] border border-[#212121]/20 text-[#212121]">
                      SCALE 1:100
                    </span>
                    <span className="px-1.5 py-0.5 bg-[#3B60C5]/10 border border-[#3B60C5]/30 text-[#3B60C5]">
                      BIM LOD 350
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 3D AXONOMETRIC & SECTION VIEWPORT ================= */}
            {(viewportMode === "3d" ||
              viewportMode === "section" ||
              viewportMode === "sun" ||
              viewportMode === "split") && (
              <div className="js-tilt-target relative w-full max-w-[920px] h-[560px] flex items-center justify-center mx-auto">
                <svg
                  ref={svg3dRef}
                  className="w-full h-full select-none overflow-visible"
                  viewBox="0 0 1000 720"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="shadow-hatch"
                      width="6"
                      height="6"
                      patternTransform="rotate(45 0 0)"
                      patternUnits="userSpaceOnUse"
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="6"
                        stroke="#212121"
                        strokeOpacity="0.22"
                        strokeWidth="1.5"
                      />
                    </pattern>
                    <pattern
                      id="cobalt-hatch"
                      width="8"
                      height="8"
                      patternTransform="rotate(-30 0 0)"
                      patternUnits="userSpaceOnUse"
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="8"
                        stroke="#3B60C5"
                        strokeOpacity="0.25"
                        strokeWidth="1.5"
                      />
                    </pattern>
                    <marker
                      id="dim-tick"
                      markerHeight="6"
                      markerWidth="6"
                      orient="auto"
                      refX="3"
                      refY="3"
                    >
                      <path d="M 0 6 L 6 0" stroke="#EC633D" strokeWidth="1.2" />
                    </marker>
                  </defs>

                  {/* 1. Isometric Ground Datum Grid Plane */}
                  <g id="ground-plane" opacity="0.65">
                    <polygon
                      points="500,90 920,330 500,570 80,330"
                      fill="#EAE0CE"
                      fillOpacity="0.35"
                      stroke="#212121"
                      strokeDasharray="4 4"
                      strokeOpacity="0.35"
                      strokeWidth="1"
                    />
                    <line
                      x1="416"
                      y1="138"
                      x2="836"
                      y2="378"
                      stroke="#212121"
                      strokeOpacity="0.12"
                      strokeWidth="0.75"
                    />
                    <line
                      x1="332"
                      y1="186"
                      x2="752"
                      y2="426"
                      stroke="#212121"
                      strokeOpacity="0.12"
                      strokeWidth="0.75"
                    />
                    <line
                      x1="248"
                      y1="234"
                      x2="668"
                      y2="474"
                      stroke="#212121"
                      strokeOpacity="0.12"
                      strokeWidth="0.75"
                    />
                    <line
                      x1="164"
                      y1="282"
                      x2="584"
                      y2="522"
                      stroke="#212121"
                      strokeOpacity="0.12"
                      strokeWidth="0.75"
                    />
                    <line
                      x1="584"
                      y1="138"
                      x2="164"
                      y2="378"
                      stroke="#212121"
                      strokeOpacity="0.12"
                      strokeWidth="0.75"
                    />
                    <line
                      x1="668"
                      y1="186"
                      x2="248"
                      y2="426"
                      stroke="#212121"
                      strokeOpacity="0.12"
                      strokeWidth="0.75"
                    />
                    <line
                      x1="752"
                      y1="234"
                      x2="332"
                      y2="474"
                      stroke="#212121"
                      strokeOpacity="0.12"
                      strokeWidth="0.75"
                    />
                    <line
                      x1="836"
                      y1="282"
                      x2="416"
                      y2="522"
                      stroke="#212121"
                      strokeOpacity="0.12"
                      strokeWidth="0.75"
                    />
                  </g>

                  {/* 2. Structural Axis Callout Bubbles */}
                  <g id="grid-markers" fontFamily="JetBrains Mono" fontSize="9">
                    <line
                      x1="248"
                      y1="234"
                      x2="200"
                      y2="206"
                      stroke="#5B5B5B"
                      strokeDasharray="2 2"
                      strokeWidth="0.75"
                    />
                    <rect
                      x="180"
                      y="192"
                      width="20"
                      height="20"
                      fill="#FDF8F0"
                      stroke="#212121"
                      strokeWidth="1"
                    />
                    <text
                      x="190"
                      y="205"
                      textAnchor="middle"
                      fill="#212121"
                      fontWeight="600"
                    >
                      A
                    </text>

                    <line
                      x1="332"
                      y1="186"
                      x2="284"
                      y2="158"
                      stroke="#5B5B5B"
                      strokeDasharray="2 2"
                      strokeWidth="0.75"
                    />
                    <rect
                      x="264"
                      y="144"
                      width="20"
                      height="20"
                      fill="#FDF8F0"
                      stroke="#212121"
                      strokeWidth="1"
                    />
                    <text
                      x="274"
                      y="157"
                      textAnchor="middle"
                      fill="#212121"
                      fontWeight="600"
                    >
                      B
                    </text>

                    <line
                      x1="416"
                      y1="138"
                      x2="368"
                      y2="110"
                      stroke="#5B5B5B"
                      strokeDasharray="2 2"
                      strokeWidth="0.75"
                    />
                    <rect
                      x="348"
                      y="96"
                      width="20"
                      height="20"
                      fill="#FDF8F0"
                      stroke="#212121"
                      strokeWidth="1"
                    />
                    <text
                      x="358"
                      y="109"
                      textAnchor="middle"
                      fill="#212121"
                      fontWeight="600"
                    >
                      C
                    </text>
                  </g>

                  {/* 3. Cast Sun Shadows (Dynamic via Shadow Angle Slider) */}
                  <g id="cast-shadows">
                    <polygon
                      points="500,470 760,320 845,368 585,518"
                      fill="url(#shadow-hatch)"
                    />
                    <polygon
                      points="300,355 500,470 435,508 235,393"
                      fill="url(#shadow-hatch)"
                    />
                  </g>

                  {/* 4. Foundation Plinth Slab (+0.00m to +0.45m) */}
                  <g id="podium-plinth">
                    <polygon
                      points="480,190 760,350 480,510 200,350"
                      fill={wireframeMode ? "none" : "#F5EFE4"}
                      stroke="#212121"
                      strokeWidth="1.2"
                    />
                    <polygon
                      points="200,350 480,510 480,526 200,366"
                      fill={wireframeMode ? "none" : "#D8CEBE"}
                      stroke="#212121"
                      strokeWidth="1.2"
                    />
                    <polygon
                      points="480,510 760,350 760,366 480,526"
                      fill={wireframeMode ? "none" : "#C7B9A5"}
                      stroke="#212121"
                      strokeWidth="1.2"
                    />
                  </g>

                  {/* 5. Central Courtyard Void */}
                  <g
                    id="courtyard-void"
                    onClick={() => setSelectedEntityKey("courtyard")}
                    className="cursor-pointer"
                  >
                    <polygon
                      points="470,290 590,360 470,430 350,360"
                      fill="#EAE0CE"
                      stroke="#212121"
                      strokeWidth="1"
                    />
                    <text
                      x="470"
                      y="364"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                      fontSize="9"
                      fill="#5B5B5B"
                      letterSpacing="1"
                    >
                      COURTYARD [+0.15]
                    </text>
                  </g>

                  {/* 6. Primary Living & Dining Pavilion Volume */}
                  <g
                    id="living-volume"
                    onClick={() => setSelectedEntityKey("living")}
                    className={`cursor-pointer transition-opacity ${
                      isolateDiff ? "opacity-25" : "opacity-100"
                    }`}
                  >
                    {/* Left Wall Extrusion */}
                    <polygon
                      points="230,332 450,458 450,348 230,222"
                      fill={wireframeMode ? "none" : "#EAE0CE"}
                      stroke="#212121"
                      strokeWidth="1.5"
                    />
                    {/* Right Wall Extrusion */}
                    <polygon
                      points="450,458 610,366 610,256 450,348"
                      fill={wireframeMode ? "none" : "#DFD3C0"}
                      stroke="#212121"
                      strokeWidth="1.5"
                    />
                    {/* Glazed Curtain Wall */}
                    <polygon
                      points="465,442 595,367 595,272 465,347"
                      fill="#3B60C5"
                      fillOpacity="0.14"
                      stroke="#3B60C5"
                      strokeWidth="1"
                    />
                    {/* Roof Slab (Animated by Extrusion Height Slider) */}
                    <g className="js-extrude-roof">
                      <polygon
                        points="390,130 610,256 450,348 230,222"
                        fill={
                          sectionCut
                            ? "rgba(236,99,61,0.12)"
                            : wireframeMode
                            ? "none"
                            : "#FDF8F0"
                        }
                        stroke={sectionCut ? "#EC633D" : "#212121"}
                        strokeDasharray={sectionCut ? "4 2" : undefined}
                        strokeWidth="1.8"
                      />
                      <text
                        x="420"
                        y="245"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono"
                        fontSize="10"
                        fontWeight="600"
                        fill="#212121"
                      >
                        LIVING PAVILION
                      </text>
                      <text
                        x="420"
                        y="258"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono"
                        fontSize="8"
                        fill="#5B5B5B"
                      >
                        H: +{(extrusionHeight / 1000).toFixed(2)}m // 68.5 m²
                      </text>
                    </g>
                  </g>

                  {/* 7. North-East Master Suite Volume */}
                  <g
                    id="master-suite-volume"
                    onClick={() => setSelectedEntityKey("master")}
                    className={`cursor-pointer transition-opacity ${
                      isolateDiff ? "opacity-25" : "opacity-100"
                    }`}
                  >
                    <polygon
                      points="480,190 680,305 680,210 480,95"
                      fill={wireframeMode ? "none" : "#E5DAC6"}
                      stroke="#212121"
                      strokeWidth="1.5"
                    />
                    <polygon
                      points="390,130 480,190 480,95 390,35"
                      fill={wireframeMode ? "none" : "#EAE0CE"}
                      stroke="#212121"
                      strokeWidth="1.5"
                    />
                    <g className="js-extrude-roof">
                      <polygon
                        points="480,45 680,160 590,212 390,97"
                        fill={wireframeMode ? "none" : "#FDF8F0"}
                        stroke="#212121"
                        strokeWidth="1.5"
                      />
                      <text
                        x="535"
                        y="135"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                        fontWeight="600"
                        fill="#212121"
                      >
                        MASTER SUITE
                      </text>
                    </g>
                  </g>

                  {/* 8. SELECTED / AI-MODIFIED VOLUME: East Terrace Extension */}
                  {diffStatus !== "discarded" && (
                    <g
                      id="target-terrace-extension"
                      onClick={() => setSelectedEntityKey("terrace")}
                      className="cursor-pointer"
                    >
                      {/* Extended Floor Deck */}
                      <polygon
                        points="610,366 740,441 580,533 450,458"
                        fill="url(#cobalt-hatch)"
                        stroke="#3B60C5"
                        strokeWidth="1.8"
                      />
                      {/* Cantilevered Pergola Roof Frame */}
                      <g className="js-extrude-roof">
                        <polygon
                          className="js-3d-wire"
                          points="610,256 740,331 580,423 450,348"
                          fill="#3B60C5"
                          fillOpacity="0.12"
                          stroke="#3B60C5"
                          strokeWidth="2"
                        />
                        {/* Timber Shading Louvers */}
                        <line
                          x1="590"
                          y1="268"
                          x2="720"
                          y2="343"
                          stroke="#3B60C5"
                          strokeWidth="1"
                        />
                        <line
                          x1="565"
                          y1="282"
                          x2="695"
                          y2="357"
                          stroke="#3B60C5"
                          strokeWidth="1"
                        />
                        <line
                          x1="540"
                          y1="296"
                          x2="670"
                          y2="371"
                          stroke="#3B60C5"
                          strokeWidth="1"
                        />
                        <line
                          x1="515"
                          y1="310"
                          x2="645"
                          y2="385"
                          stroke="#3B60C5"
                          strokeWidth="1"
                        />
                        <line
                          x1="490"
                          y1="324"
                          x2="620"
                          y2="399"
                          stroke="#3B60C5"
                          strokeWidth="1"
                        />
                        <line
                          x1="465"
                          y1="338"
                          x2="595"
                          y2="413"
                          stroke="#3B60C5"
                          strokeWidth="1"
                        />
                      </g>

                      {/* Vertical Structural Steel Columns */}
                      <line
                        x1="740"
                        y1="441"
                        x2="740"
                        y2="331"
                        stroke="#3B60C5"
                        strokeWidth="2"
                      />
                      <line
                        x1="580"
                        y1="533"
                        x2="580"
                        y2="423"
                        stroke="#3B60C5"
                        strokeWidth="2"
                      />

                      {/* Vertex Selection Nodes */}
                      <rect
                        x="736"
                        y="327"
                        width="8"
                        height="8"
                        fill="#FFFBF3"
                        stroke="#EC633D"
                        strokeWidth="2"
                      />
                      <rect
                        x="576"
                        y="419"
                        width="8"
                        height="8"
                        fill="#FFFBF3"
                        stroke="#EC633D"
                        strokeWidth="2"
                      />
                      <rect
                        x="576"
                        y="529"
                        width="8"
                        height="8"
                        fill="#FFFBF3"
                        stroke="#3B60C5"
                        strokeWidth="2"
                      />

                      {/* Floating Callout Flag */}
                      <line
                        x1="740"
                        y1="331"
                        x2="795"
                        y2="275"
                        stroke="#EC633D"
                        strokeWidth="1.2"
                      />
                      <rect
                        x="795"
                        y="248"
                        width="175"
                        height="44"
                        fill="#FDF8F0"
                        stroke="#EC633D"
                        strokeWidth="1.2"
                      />
                      <rect
                        x="795"
                        y="248"
                        width="4"
                        height="44"
                        fill="#EC633D"
                      />
                      <text
                        x="807"
                        y="265"
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                        fontWeight="600"
                        fill="#EC633D"
                      >
                        {diffStatus === "committed"
                          ? "BIM COMMITTED [REV.5]"
                          : "AI PROPOSED DIFF [REV.4]"}
                      </text>
                      <text
                        x="807"
                        y="281"
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                        fill="#212121"
                      >
                        +2.4m TERRACE CANTILEVER
                      </text>
                    </g>
                  )}

                  {/* 9. Technical Dimension Strings */}
                  <g
                    id="dimension-strings"
                    fontFamily="JetBrains Mono"
                    fontSize="9"
                    fill="#EC633D"
                  >
                    <line
                      x1="450"
                      y1="485"
                      x2="580"
                      y2="560"
                      stroke="#EC633D"
                      strokeWidth="1"
                      markerStart="url(#dim-tick)"
                      markerEnd="url(#dim-tick)"
                    />
                    <rect
                      x="485"
                      y="514"
                      width="62"
                      height="16"
                      fill="#FDF8F0"
                      stroke="#EC633D"
                      strokeWidth="0.75"
                    />
                    <text
                      x="516"
                      y="525"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      2,400 mm
                    </text>

                    <line
                      x1="210"
                      y1="332"
                      x2="210"
                      y2="222"
                      stroke="#EC633D"
                      strokeWidth="1"
                      markerStart="url(#dim-tick)"
                      markerEnd="url(#dim-tick)"
                    />
                    <rect
                      x="140"
                      y="269"
                      width="62"
                      height="16"
                      fill="#FDF8F0"
                      stroke="#EC633D"
                      strokeWidth="0.75"
                    />
                    <text
                      x="171"
                      y="280"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {extrusionHeight.toLocaleString()} mm
                    </text>
                  </g>
                </svg>
              </div>
            )}
          </div>

          {/* Bottom-Center Zoom & Mode Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center bg-[#FDF8F0] border border-[#212121] shadow-[3px_3px_0px_rgba(33,33,33,0.12)] px-2 py-1 space-x-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(60, z - 15))}
              className="w-6 h-6 flex items-center justify-center font-mono text-xs hover:bg-[#EAE0CE] cursor-pointer"
            >
              -
            </button>
            <span className="font-mono text-[11px] font-semibold text-[#212121] min-w-[44px] text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(180, z + 15))}
              className="w-6 h-6 flex items-center justify-center font-mono text-xs hover:bg-[#EAE0CE] cursor-pointer"
            >
              +
            </button>
            <div className="h-4 w-px bg-[#212121]/20" />
            <span className="font-mono text-[10px] text-[#5B5B5B] px-1">
              ACTIVE ENTITY:{" "}
              <strong className="text-[#3B60C5]">{inspected.id}</strong>
            </span>
          </div>

          {/* Bottom-Right CAD Title Block Stamp */}
          <div className="hidden lg:block absolute bottom-4 right-4 z-20 bg-[#FDF8F0]/95 border border-[#212121] w-72 shadow-[3px_3px_0px_rgba(33,33,33,0.1)] pointer-events-none">
            <div className="grid grid-cols-3 border-b border-[#212121]/20 font-mono text-[9px]">
              <div className="p-1.5 border-r border-[#212121]/20">
                <div className="text-[#5B5B5B]">PROJECT</div>
                <div className="font-semibold text-[#212121]">
                  {projectMeta.code}
                </div>
              </div>
              <div className="p-1.5 border-r border-[#212121]/20">
                <div className="text-[#5B5B5B]">SCALE</div>
                <div className="font-semibold text-[#212121]">1:100 @ A1</div>
              </div>
              <div className="p-1.5">
                <div className="text-[#5B5B5B]">SHEET</div>
                <div className="font-semibold text-[#EC633D]">
                  {viewportMode === "2d" ? "A-101 PLAN" : "AXO-04"}
                </div>
              </div>
            </div>
            <div className="p-2 flex items-center justify-between">
              <div>
                <div className="font-serif text-sm text-[#212121] leading-none">
                  {projectMeta.name} &mdash; Massing
                </div>
                <div className="font-mono text-[8px] text-[#5B5B5B] mt-0.5 uppercase tracking-widest">
                  ILLOCA ARCHITECTURAL LAB
                </div>
              </div>
              <div className="w-5 h-5 border border-[#212121] flex items-center justify-center font-mono text-[9px] font-bold">
                N
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: AI ARCHITECT COPILOT & BIM INSPECTOR (360px) */}
        <aside className="w-[360px] bg-[#EAE0CE] border-l border-[#212121]/15 flex flex-col justify-between z-30 shrink-0">
          {/* Copilot Header */}
          <div className="p-4 border-b border-[#212121]/15 bg-[#FDF8F0] flex items-center justify-between js-studio-right">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 bg-[#EC633D] flex items-center justify-center border border-[#212121]">
                <span className="material-symbols-outlined text-[#FFFBF3] text-[15px]">
                  temp_preferences_custom
                </span>
              </div>
              <div>
                <div className="font-serif text-lg leading-none text-[#212121]">
                  AI Architect Copilot
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-[#3B60C5] flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-[#3B60C5] inline-block" />
                  <span>Online &amp; Synced</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                triggerToast("COPILOT MEMORY GRAPH SYNCHRONIZED // 14 NODES")
              }
              className="w-7 h-7 border border-[#212121]/20 flex items-center justify-center text-[#5B5B5B] hover:text-[#212121] bg-[#EAE0CE]/40 cursor-pointer"
              title="Prompt History"
            >
              <span className="material-symbols-outlined text-[15px]">
                history
              </span>
            </button>
          </div>

          {/* Active Selection Context Card */}
          <div className="p-3.5 border-b border-[#212121]/15 bg-[#EAE0CE]/70 js-studio-right">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#5B5B5B]">
                INSPECTED ENTITY
              </span>
              <span className="font-mono text-[10px] text-[#3B60C5] font-semibold">
                {inspected.id}
              </span>
            </div>
            <div className="p-2.5 bg-[#FDF8F0] border border-[#212121]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-semibold text-[#212121]">
                  {inspected.title}
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#3B60C5]/10 text-[#3B60C5] border border-[#3B60C5]/20">
                  {inspected.badge}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-[#212121]/10 font-mono text-[10px]">
                <div>
                  <div className="text-[#5B5B5B] text-[8px]">LEVEL</div>
                  <div className="text-[#212121] font-medium truncate">
                    {inspected.level}
                  </div>
                </div>
                <div>
                  <div className="text-[#5B5B5B] text-[8px]">STRUCTURE</div>
                  <div className="text-[#212121] font-medium truncate">
                    {inspected.structure}
                  </div>
                </div>
                <div>
                  <div className="text-[#5B5B5B] text-[8px]">AREA / SPEC</div>
                  <div className="text-[#212121] font-medium truncate">
                    {inspected.area}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversational Prompt & Iteration History */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDF8F0]/50"
          >
            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="space-y-1.5 js-studio-right">
                  <div className="flex items-center justify-between font-mono text-[9px] text-[#5B5B5B]">
                    <span>ARCHITECT INTENT</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="p-3 bg-[#FFFBF3] border border-[#212121]/20 font-sans text-xs text-[#212121] leading-relaxed">
                    &ldquo;{msg.text}&rdquo;
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="space-y-2 js-studio-right">
                  <div className="flex items-center justify-between font-mono text-[9px]">
                    <span className="text-[#3B60C5] font-semibold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-[#EC633D] inline-block" />
                      <span>ILLOCA ENGINE</span>
                    </span>
                    <span className="text-[#5B5B5B]">{msg.timestamp}</span>
                  </div>

                  <div className="bg-[#FDF8F0] border border-[#212121] p-3 space-y-3 shadow-[3px_3px_0px_rgba(33,33,33,0.08)]">
                    <p className="font-sans text-xs text-[#212121] leading-relaxed">
                      {msg.text}
                    </p>

                    {msg.metrics && (
                      <div className="bg-[#EAE0CE]/60 border border-[#212121]/15 p-2 font-mono text-[10px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#5B5B5B]">Cantilever Span:</span>
                          <span className="text-[#212121] font-semibold">
                            {msg.metrics.span}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5B5B5B]">Solar Heat Gain:</span>
                          <span className="text-[#3B60C5] font-semibold">
                            {msg.metrics.solar}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5B5B5B]">Net GFA Delta:</span>
                          <span className="text-[#212121] font-semibold">
                            {msg.metrics.gfa}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Diff Action Buttons */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsolateDiff((prev) => !prev);
                          triggerToast(
                            isolateDiff
                              ? "RESTORED FULL BUILDING ENVELOPE"
                              : "ISOLATED #ENT-9042 EAST TERRACE EXTENSION"
                          );
                        }}
                        className={`py-1.5 border font-mono text-[9px] uppercase tracking-wider cursor-pointer ${
                          isolateDiff
                            ? "bg-[#212121] text-[#FFFBF3] border-[#212121]"
                            : "bg-[#EAE0CE] text-[#212121] border-[#212121]/25 hover:bg-[#212121] hover:text-[#FFFBF3]"
                        }`}
                      >
                        {isolateDiff ? "Show All" : "Isolate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDiffStatus((s) =>
                            s === "discarded" ? "proposed" : "discarded"
                          );
                          triggerToast(
                            diffStatus === "discarded"
                              ? "RESTORED AI TERRACE DIFF"
                              : "DISCARDED PROPOSED TERRACE DIFF"
                          );
                        }}
                        className="py-1.5 bg-[#FDF8F0] border border-[#212121]/25 font-mono text-[9px] uppercase tracking-wider text-[#5B5B5B] hover:text-[#EC633D] cursor-pointer"
                      >
                        {diffStatus === "discarded" ? "Restore" : "Discard"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDiffStatus("committed");
                          triggerToast("APPLIED & LOCKED INTO BIM MODEL [REV.5]");
                        }}
                        className="py-1.5 bg-[#3B60C5] text-[#FFFBF3] border border-[#212121] font-mono text-[9px] uppercase tracking-wider font-semibold hover:bg-[#EC633D] cursor-pointer"
                      >
                        {diffStatus === "committed" ? "Committed" : "Commit BIM"}
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}

            {isSynthesizing && (
              <div className="p-3 bg-[#FDF8F0] border border-[#3B60C5] font-mono text-[10px] text-[#3B60C5] flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#EC633D] animate-ping" />
                <span>SOLVING STRUCTURAL TOPOLOGY &amp; SOLAR VECTORS...</span>
              </div>
            )}

            {/* Quick Suggested Prompts */}
            <div className="space-y-1.5 pt-1">
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#5B5B5B]">
                SUGGESTED REFINEMENTS
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "+ Add Pergola Louver Density",
                  "Align East Facade with Level 02",
                  "Check Sun Angle (Summer Solstice)",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleSendPrompt(chip)}
                    className="px-2 py-1 bg-[#EAE0CE]/80 hover:bg-[#EAE0CE] border border-[#212121]/15 font-mono text-[9px] text-[#212121] transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Prompt Input Box */}
          <div className="p-3.5 bg-[#EAE0CE] border-t border-[#212121]/15 js-studio-right">
            <div className="bg-[#FFFBF3] border border-[#212121] p-2.5 focus-within:border-[#3B60C5] transition-colors shadow-[2px_2px_0px_rgba(33,33,33,0.08)]">
              <textarea
                rows={2}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey || e.shiftKey === false) && e.key === "Enter") {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                placeholder="Describe spatial or structural modification..."
                className="w-full bg-transparent border-0 p-0 text-xs font-sans text-[#212121] placeholder-[#9C9C9C] focus:ring-0 focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#212121]/10">
                <div className="flex items-center space-x-1">
                  <span className="font-mono text-[9px] text-[#5B5B5B] px-1.5 py-0.5 bg-[#EAE0CE]/50">
                    {viewportMode.toUpperCase()} SYNC
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendPrompt()}
                  className="h-7 px-3 bg-[#3B60C5] text-[#FFFBF3] border border-[#212121] font-mono text-[10px] uppercase tracking-wider font-medium flex items-center space-x-1.5 hover:bg-[#EC633D] transition-colors cursor-pointer"
                >
                  <span>Synthesize</span>
                  <span className="material-symbols-outlined text-[12px]">
                    arrow_upward
                  </span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#FDF8F0] flex items-center justify-center font-mono text-xs text-[#212121]">
          INITIALIZING ILLOCA ARCHITECTURAL STUDIO CANVAS...
        </div>
      }
    >
      <StudioCanvasInner />
    </Suspense>
  );
}
