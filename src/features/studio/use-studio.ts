"use client";
import { resolveProjectReference } from "@/shared/contracts/project";
import { useTimeouts } from "@/shared/hooks/use-timeouts";
import { useToast } from "@/shared/hooks/use-toast";
import { ENTITIES } from "./data/sample-studio";
import { CopilotMessage,DraftingTool,PlacedStamp,ViewportMode } from "./model/types";
import { proposeStudioChange } from "./services/copilot";

import { useAuth } from "@/features/auth/client";
import gsap from "@/shared/animation";
import { useSearchParams } from "next/navigation";
import React,{ useEffect,useLayoutEffect,useRef,useState } from "react";
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useStudio() {
  const schedule = useTimeouts();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();

  const projectSlug = searchParams.get("project") || "villa-sognate";
  const initialModeParam = searchParams.get("mode");
  const projectMeta = resolveProjectReference(projectSlug);

  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sheet2dRef = useRef<HTMLDivElement>(null);
  const svg3dRef = useRef<SVGSVGElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const cursorReadoutRef = useRef<HTMLDivElement>(null);
  const cursorMmRef = useRef<{ x: number; y: number }>({ x: 14280, y: 8640 });

  const [viewportMode, setViewportModeState] = useState<ViewportMode>(
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

  const setViewportMode = (mode: ViewportMode) => {
    setViewportModeState(mode);
    if (mode === "section") setSectionCut(true);
    if (mode === "sun") setSunShadows(true);
  };

  // Pan & Zoom State
  const [zoom, setZoom] = useState<number>(100);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const livePanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const draggingRef = useRef<boolean>(false);
  const panRafRef = useRef<number>(0);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  const [mobileToolsOpen, setMobileToolsOpen] = useState<boolean>(false);
  const [mobileCopilotOpen, setMobileCopilotOpen] = useState<boolean>(false);
  const [placedStamps, setPlacedStamps] = useState<PlacedStamp[]>([]);
  const { toastMessage, triggerToast } = useToast(3600);

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


  // GSAP Entrance Animations
  useIsoLayoutEffect(() => {
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
    const vpEl = viewportRef.current as (HTMLDivElement & { _rect?: DOMRect; _targets?: NodeListOf<Element> }) | null;
    if (vpEl) {
      vpEl._rect = undefined;
      vpEl._targets = undefined;
    }


    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".js-viewport-stage",
        { opacity: 0.25 },
        { opacity: 1, duration: 0.45, ease: "expo.out" }
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

  useEffect(() => {
    const clear = () => {
      const vpEl = viewportRef.current as (HTMLDivElement & { _rect?: DOMRect }) | null;
      if (vpEl) vpEl._rect = undefined;
    };
    window.addEventListener("resize", clear, { passive: true });
    return () => window.removeEventListener("resize", clear);
  }, []);

  // Parametric Extrusion Height + Shadow Angle + Section Cut GSAP Updates
  useEffect(() => {
    if (!svg3dRef.current) return;
    // Scale vertical offset based on extrusionHeight (default 3200 -> 0 offset)
    const deltaY = ((3200 - extrusionHeight) / 1000) * 32;
    gsap.to(rootRef.current?.querySelectorAll(".js-extrude-roof") ?? [], {
      y: deltaY,
      duration: 0.35,
      ease: "power2.out",
    });

    // Shadow angle displacement
    const rad = (shadowAngle * Math.PI) / 180;
    const shadowShiftX = Math.cos(rad) * 18;
    const shadowShiftY = Math.sin(rad) * 12;
    gsap.to(rootRef.current?.querySelectorAll("#cast-shadows") ?? [], {
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

    if (draggingRef.current) {
      applyLivePan(
        dragStartRef.current.panX + (e.clientX - dragStartRef.current.x),
        dragStartRef.current.panY + (e.clientY - dragStartRef.current.y)
      );
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
        force3D: "auto",
        transformPerspective: 1200,
      });
    }
  };

  const applyLivePan = (x: number, y: number) => {
    livePanRef.current = { x, y };
    if (panRafRef.current) return;
    panRafRef.current = requestAnimationFrame(() => {
      panRafRef.current = 0;
      if (stageRef.current) {
        const p = livePanRef.current;
        stageRef.current.style.transform = `translate(${p.x}px, ${p.y}px) scale(${zoom / 100})`;
      }
    });
  };

  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    setPan({ ...livePanRef.current });
  };

  const handleViewportMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "pan" || e.button === 1 || e.shiftKey) {
      draggingRef.current = true;
      livePanRef.current = { ...pan };
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
    endDrag();
  };

  // Touch pan & drag event handlers for mobile/tablet canvas navigation
  const handleViewportTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      draggingRef.current = true;
      livePanRef.current = { ...pan };
      setIsDragging(true);
      const touch = e.touches[0];
      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleViewportTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && draggingRef.current) {
      const touch = e.touches[0];
      if (viewportMode === "3d" || viewportMode === "section" || viewportMode === "sun") {
        const dx = (touch.clientX - dragStartRef.current.x) * 0.12;
        const dy = (touch.clientY - dragStartRef.current.y) * 0.12;
        gsap.to(rootRef.current?.querySelectorAll(".js-tilt-target") ?? [], {
          rotateY: Math.max(-25, Math.min(25, dx)),
          rotateX: Math.max(-20, Math.min(20, -dy)),
          duration: 0.22,
          ease: "power2.out",
          overwrite: "auto",
          force3D: "auto",
        });
      }
      applyLivePan(
        dragStartRef.current.panX + (touch.clientX - dragStartRef.current.x),
        dragStartRef.current.panY + (touch.clientY - dragStartRef.current.y)
      );
    }
  };

  const handleViewportTouchEnd = () => {
    endDrag();
  };

  const handleResetCamera = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
    setIsolateDiff(false);
    gsap.to(rootRef.current?.querySelectorAll(".js-tilt-target") ?? [], {
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
    schedule(() => {
      const proposal = proposeStudioChange(text);
      if (proposal.patch.louverDensity !== undefined) setLouverDensity(proposal.patch.louverDensity);
      if (proposal.patch.diffStatus !== undefined) setDiffStatus(proposal.patch.diffStatus);
      if (proposal.patch.viewportMode !== undefined) setViewportMode(proposal.patch.viewportMode);
      if (proposal.patch.sunShadows !== undefined) setSunShadows(proposal.patch.sunShadows);
      if (proposal.patch.shadowAngle !== undefined) setShadowAngle(proposal.patch.shadowAngle);
      if (proposal.patch.extrusionHeight !== undefined) setExtrusionHeight(proposal.patch.extrusionHeight);

      const aiMsg: CopilotMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        timestamp: "SYNTHESIS COMPLETE // 0.9s",
        text: proposal.text,
        metrics: proposal.metrics,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsSynthesizing(false);

      schedule(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 60);
    }, 650);
  };

  const inspected = ENTITIES[selectedEntityKey] || ENTITIES.terrace;
  return { currentUser, projectMeta, rootRef, viewportRef, sheet2dRef, svg3dRef, chatScrollRef, cursorReadoutRef, viewportMode, setViewportMode, activeTool, setActiveTool, activePipeline, setActivePipeline, selectedEntityKey, setSelectedEntityKey, extrusionHeight, setExtrusionHeight, slabThickness, setSlabThickness, sectionCut, setSectionCut, wireframeMode, setWireframeMode, sunShadows, setSunShadows, shadowAngle, setShadowAngle, louverDensity, diffStatus, setDiffStatus, isolateDiff, setIsolateDiff, zoom, setZoom, pan, isDragging, stageRef, mobileToolsOpen, setMobileToolsOpen, mobileCopilotOpen, setMobileCopilotOpen, placedStamps, setPlacedStamps, toastMessage, promptInput, setPromptInput, isSynthesizing, messages, triggerToast, handleViewportMouseMove, handleViewportMouseDown, handleViewportMouseUp, handleViewportTouchStart, handleViewportTouchMove, handleViewportTouchEnd, handleResetCamera, handleSheetClick, handleSendPrompt, inspected };
}
