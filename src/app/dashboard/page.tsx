"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useAuth } from "@/context/AuthContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const canHover = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

export interface ArchitecturalProject {
  index: string;
  id: string;
  plotCode: string;
  title: string;
  subtitle: string;
  category: "Residential" | "Commercial" | "Multi-Family" | "Urban" | "Cultural";
  statusLabel: string;
  statusColor: "cobalt" | "vermilion" | "ink";
  statusPulse?: boolean;
  area: string;
  areaNum: number;
  lod: string;
  lodNum: number;
  updated: string;
  revisionOrder: number;
  zoning: string;
  levels: string;
  ctaLabel: string;
  image: string;
  renderImage: string;
  imageAlt: string;
}

const INITIAL_PROJECTS: ArchitecturalProject[] = [
  {
    index: "01",
    id: "villa-sognate",
    plotCode: "PLOT // VS-049",
    title: "Villa Sognate",
    subtitle: "Cantilevered limestone residence with central courtyard massing.",
    category: "Residential",
    statusLabel: "BIM SYNCED",
    statusColor: "cobalt",
    area: "840 m²",
    areaNum: 840,
    lod: "LOD 350",
    lodNum: 350,
    updated: "2h ago",
    revisionOrder: 1,
    zoning: "R-1 Hillside",
    levels: "3 Levels",
    ctaLabel: "Open Canvas",
    image: "/images/plamo/examples/spine-shelter-pavilion-linework.webp",
    renderImage: "/images/plamo/examples/spine-shelter-pavilion.webp",
    imageAlt:
      "Architectural 2D floor plan and 3D massing blueprint of Villa Sognate hillside residence",
  },
  {
    index: "02",
    id: "nordic-horizon",
    plotCode: "PLOT // NH-112",
    title: "Nordic Horizon Mixed-Use",
    subtitle: "Timber-hybrid commercial podium with stepped residential towers.",
    category: "Commercial",
    statusLabel: "AI SYNTHESIS",
    statusColor: "vermilion",
    statusPulse: true,
    area: "14,200 m²",
    areaNum: 14200,
    lod: "LOD 300",
    lodNum: 300,
    updated: "5h ago",
    revisionOrder: 2,
    zoning: "C-3 Urban Core",
    levels: "8 Levels",
    ctaLabel: "Open Canvas",
    image: "/images/plamo/examples/through-lot-office-linework.webp",
    renderImage: "/images/plamo/examples/through-lot-office.webp",
    imageAlt:
      "Isometric architectural massing diagram of Nordic Horizon mixed-use timber complex",
  },
  {
    index: "03",
    id: "atelier-pavilion",
    plotCode: "PLOT // AP-088",
    title: "Atelier Pavilion",
    subtitle: "Long-span steel exhibition gallery with north-facing sawtooth roof.",
    category: "Multi-Family",
    statusLabel: "DRAFTING",
    statusColor: "ink",
    area: "1,650 m²",
    areaNum: 1650,
    lod: "LOD 200",
    lodNum: 200,
    updated: "1d ago",
    revisionOrder: 3,
    zoning: "P-2 Civic",
    levels: "2 Levels",
    ctaLabel: "Open Canvas",
    image: "/images/plamo/examples/fin-screen-art-museum-linework.webp",
    renderImage: "/images/plamo/examples/fin-screen-art-museum.webp",
    imageAlt:
      "Minimalist architectural structural grid and section drawing of Atelier Pavilion",
  },
  {
    index: "04",
    id: "kyoto-townhome",
    plotCode: "PLOT // KT-204",
    title: "Kyoto Urban Townhome",
    subtitle: "Narrow-lot machiya reinterpretation with vertical lightwell atrium.",
    category: "Residential",
    statusLabel: "BIM SYNCED",
    statusColor: "cobalt",
    area: "320 m²",
    areaNum: 320,
    lod: "LOD 400",
    lodNum: 400,
    updated: "3d ago",
    revisionOrder: 4,
    zoning: "R-2 Infill",
    levels: "4 Levels",
    ctaLabel: "Open Canvas",
    image: "/images/plamo/examples/curved-brick-facade-linework.webp",
    renderImage: "/images/plamo/examples/curved-brick-facade.webp",
    imageAlt:
      "Detailed floor plan and structural section of narrow Kyoto Urban Townhome",
  },
  {
    index: "05",
    id: "aero-industrial",
    plotCode: "PLOT // AI-501",
    title: "Aero Industrial Park Hub",
    subtitle: "Modular robotics assembly campus with automated logistics spine.",
    category: "Urban",
    statusLabel: "SCHEMATIC",
    statusColor: "ink",
    area: "31,240 m²",
    areaNum: 31240,
    lod: "LOD 250",
    lodNum: 250,
    updated: "1w ago",
    revisionOrder: 5,
    zoning: "M-2 Logistics",
    levels: "2 Levels",
    ctaLabel: "Open Canvas",
    image: "/images/plamo/examples/high-speed-rail-station-linework.webp",
    renderImage: "/images/plamo/examples/high-speed-rail-station.webp",
    imageAlt:
      "Masterplan site layout and circulation vectors of Aero Industrial Park Hub",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const areaCounterRef = useRef<HTMLSpanElement>(null);
  const plotsCounterRef = useRef<HTMLSpanElement>(null);
  const leadsCounterRef = useRef<HTMLSpanElement>(null);
  const sideLatRef = useRef<HTMLSpanElement>(null);
  const sideLonRef = useRef<HTMLSpanElement>(null);
  const footerCoordsRef = useRef<HTMLSpanElement>(null);

  const [projects, setProjects] = useState<ArchitecturalProject[]>(INITIAL_PROJECTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTopNav, setActiveTopNav] = useState<string>("Models");
  const [activeSideNav, setActiveSideNav] = useState<string>("Drafting");

  // Interactive Modal state for New Masterplan / AI Synthesis / Export IFC
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [previewModes, setPreviewModes] = useState<Record<string, "2d" | "3d">>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createPreset, setCreatePreset] = useState<"ai" | "blank">("ai");
  const [newTitle, setNewTitle] = useState("Solaris Courtyard Pavilion");
  const [newCategory, setNewCategory] =
    useState<ArchitecturalProject["category"]>("Residential");
  const [newArea, setNewArea] = useState("1,480");
  const [newZoning, setNewZoning] = useState("R-2 Hillside");
  const [newLevels, setNewLevels] = useState("3 Levels");
  const [newPrompt, setNewPrompt] = useState(
    "Generate a 3-story courtyard residence with passive southern solar overhang, board-formed concrete shear cores, and a cantilevered east dining terrace."
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  // Keyboard shortcut Cmd/Ctrl + K to focus search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowCreateModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Filtered & sorted projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesCat =
          selectedCategory === "All" ||
          p.category.toLowerCase() === selectedCategory.toLowerCase();
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.plotCode.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.zoning.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "area-desc") return b.areaNum - a.areaNum;
        if (sortBy === "area-asc") return a.areaNum - b.areaNum;
        if (sortBy === "lod") return b.lodNum - a.lodNum;
        return a.revisionOrder - b.revisionOrder;
      });
  }, [projects, selectedCategory, searchQuery, sortBy]);

  // Lenis Smooth Scroll + GSAP Entrance + ScrollTrigger + Metric Count-Up
  useIsoLayoutEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: false,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".js-dash-top",
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.05 }
      );

      tl.fromTo(
        ".js-dash-side",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.55, stagger: 0.04 },
        "-=0.4"
      );

      tl.fromTo(
        ".js-dash-hero",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.08 },
        "-=0.45"
      );

      tl.fromTo(
        ".js-metric-card",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
        "-=0.4"
      );

      // Animated Metric Counters
      const areaObj = { val: 0 };
      gsap.to(areaObj, {
        val: 48250,
        duration: 1.8,
        ease: "power3.out",
        onUpdate: () => {
          if (areaCounterRef.current) {
            areaCounterRef.current.textContent = Math.round(
              areaObj.val
            ).toLocaleString();
          }
        },
      });

      const plotsObj = { val: 0 };
      gsap.to(plotsObj, {
        val: 14,
        duration: 1.4,
        ease: "power2.out",
        onUpdate: () => {
          if (plotsCounterRef.current) {
            plotsCounterRef.current.textContent = String(Math.round(plotsObj.val));
          }
        },
      });

      const leadsObj = { val: 0 };
      gsap.to(leadsObj, {
        val: 6,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          if (leadsCounterRef.current) {
            leadsCounterRef.current.textContent = String(
              Math.round(leadsObj.val)
            ).padStart(2, "0");
          }
        },
      });

      // ScrollTrigger for Editorial Essay Pull-Quote Strip
      gsap.fromTo(
        ".js-essay-strip",
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".js-essay-strip",
            start: "top 88%",
          },
        }
      );
    }, rootRef);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  // Animate project cards whenever filter, sort, or viewMode changes
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".js-project-card",
        { y: 22, opacity: 0, scale: 0.985 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.out",
          overwrite: "auto",
        }
      );
    }, rootRef);
    return () => ctx.revert();
  }, [selectedCategory, sortBy, viewMode, projects.length]);

  // Global mouse move for live coordinate readout (direct DOM update for 120fps)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const lat = (37.7749 + (e.clientY / window.innerHeight - 0.5) * 0.01).toFixed(4);
    const lon = (-122.4194 + (e.clientX / window.innerWidth - 0.5) * 0.01).toFixed(4);
    if (sideLatRef.current) sideLatRef.current.textContent = `LAT: ${lat}° N`;
    if (sideLonRef.current) sideLonRef.current.textContent = `LON: ${lon}° W`;
    if (footerCoordsRef.current) {
      footerCoordsRef.current.textContent = `X: ${lat} // Y: ${lon} // Z: 0.00m`;
    }
  };

  // 3D Card Tilt & Image Parallax on Project Cards (cached rect for 0ms latency)
  const handleCardMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!canHover()) return;
    const card = e.currentTarget as HTMLElement & {
      _rect?: DOMRect;
      _imgs?: NodeListOf<Element>;
    };
    card._rect = card.getBoundingClientRect();
    card._imgs = card.querySelectorAll(".js-card-img");
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!canHover()) return;
    const card = e.currentTarget as HTMLElement & {
      _rect?: DOMRect;
      _imgs?: NodeListOf<Element>;
    };
    const rect = card._rect || (card._rect = card.getBoundingClientRect());
    const relX = (e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
    const relY = (e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;

    gsap.to(card, {
      rotateY: relX * 5.5,
      rotateX: -relY * 5.5,
      y: -3,
      duration: 0.18,
      ease: "expo.out",
      overwrite: "auto",
      force3D: "auto",
      transformPerspective: 1000,
    });

    const imgs = card._imgs || card.querySelectorAll(".js-card-img");
    if (imgs.length) {
      gsap.to(imgs, {
        x: relX * -12,
        y: relY * -12,
        scale: 1,
        duration: 0.2,
        ease: "expo.out",
        overwrite: "auto",
        force3D: "auto",
      });
    }
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (!canHover()) return;
    const card = e.currentTarget as HTMLElement & {
      _imgs?: NodeListOf<Element>;
    };
    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      y: 0,
      duration: 0.28,
      ease: "expo.out",
      overwrite: "auto",
      force3D: "auto",
    });
    const imgs = card._imgs || card.querySelectorAll(".js-card-img");
    if (imgs.length) {
      gsap.to(imgs, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.28,
        ease: "expo.out",
        overwrite: "auto",
        force3D: "auto",
      });
    }
  };

  const handleCreatePlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextIdx = String(projects.length + 1).padStart(2, "0");
    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const numericArea = parseInt(newArea.replace(/[^0-9]/g, ""), 10) || 1200;

    const created: ArchitecturalProject = {
      index: nextIdx,
      id: `${slug || "plot"}-${nextIdx}-${Date.now().toString(36).slice(-4)}`,
      plotCode: `PLOT // SP-${100 + projects.length + 1}`,
      title: newTitle,
      subtitle:
        createPreset === "ai"
          ? newPrompt
          : "Custom orthographic schematic initialized on 100mm structural grid.",
      category: newCategory,
      statusLabel: createPreset === "ai" ? "AI SYNTHESIS" : "DRAFTING",
      statusColor: createPreset === "ai" ? "vermilion" : "cobalt",
      statusPulse: createPreset === "ai",
      area: `${numericArea.toLocaleString()} m²`,
      areaNum: numericArea,
      lod: "LOD 300",
      lodNum: 300,
      updated: "Just now",
      revisionOrder: 0,
      zoning: newZoning,
      levels: newLevels,
      ctaLabel: "Open Canvas",
      image: INITIAL_PROJECTS[0].image,
      renderImage: INITIAL_PROJECTS[0].renderImage,
      imageAlt: `Architectural blueprint for ${newTitle}`,
    };

    setProjects((prev) => [created, ...prev]);
    setShowCreateModal(false);
    triggerToast(`PLOT [${created.plotCode}] INITIALIZED // READY FOR CANVAS`);
  };

  return (
    <div
      ref={rootRef}
      onMouseMove={handleMouseMove}
      className="tactile-editorial-root bg-surface-canvas text-ink-black font-body antialiased selection:bg-cobalt-electric selection:text-paper-white min-h-screen flex flex-col"
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[70] bg-ink-black text-paper-white border border-cobalt-electric px-4 py-3 shadow-[4px_4px_0px_#3B60C5] flex items-center space-x-3 font-mono text-xs">
          <span className="w-2 h-2 bg-cadmium-vermilion animate-ping" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-pencil-gray hover:text-paper-white ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TopAppBar: Fixed Architectural System Bar */}
      <header className="fixed top-0 inset-x-0 h-14 bg-[#FDF8F0] border-b border-[#212121]/15 z-50 flex items-center justify-between px-6">
        {/* Left: Brand & Project Breadcrumb */}
        <div className="flex items-center space-x-6 js-dash-top">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen((v) => !v)}
              className="md:hidden p-1.5 text-[#212121] hover:bg-[#EAE0CE] border border-[#212121]/30 transition-colors cursor-pointer"
              aria-label="Toggle workspace sidebar"
              aria-expanded={mobileSidebarOpen}
            >
              <span className="material-symbols-outlined text-[20px] block">
                {mobileSidebarOpen ? "close" : "menu"}
              </span>
            </button>
            <Link
              href="/"
              className="w-7 h-7 bg-[#3B60C5] flex items-center justify-center border border-[#212121]"
            >
              <span className="font-mono text-xs font-bold text-[#FFFBF3] tracking-tighter">
                IL
              </span>
            </Link>
            <div className="flex items-center space-x-2">
              <Link
                href="/"
                className="font-mono font-bold tracking-tight text-[#212121] text-sm uppercase"
              >
                ILLOCA
              </Link>
              <span className="font-mono text-xs text-[#9C9C9C]">/</span>
              <span className="font-mono text-xs text-[#5B5B5B] uppercase tracking-wider">
                ARC-049
              </span>
            </div>
          </div>

          {/* Primary Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 pl-4 border-l border-[#212121]/15 h-8">
            {[
              { id: "Models", label: "Models", badge: `0${projects.length}` },
              { id: "Schedules", label: "Schedules" },
              { id: "Simulations", label: "Simulations" },
              { id: "Sheets", label: "Sheets" },
            ].map((tab) => {
              const active = activeTopNav === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTopNav(tab.id);
                    if (tab.id === "Schedules") setViewMode("list");
                    if (tab.id === "Models") setViewMode("grid");
                    if (tab.id === "Simulations" || tab.id === "Sheets") {
                      triggerToast(`${tab.id.toUpperCase()} MODULE SYNCHRONIZED WITH BIM CORE`);
                    }
                  }}
                  className={`font-mono text-xs uppercase tracking-wider pb-0.5 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    active
                      ? "text-[#3B60C5] font-semibold border-b-2 border-[#EC633D]"
                      : "text-[#5B5B5B] hover:text-[#212121]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="bg-[#3B60C5]/10 text-[#3B60C5] px-1.5 py-0.2 text-[10px]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <Link
              href="/about"
              className="font-mono text-xs uppercase tracking-wider text-[#5B5B5B] hover:text-[#212121] transition-colors"
            >
              About Us
            </Link>
          </nav>
        </div>

        {/* Right: Search, Global Tools & Actions */}
        <div className="flex items-center space-x-4 js-dash-top">
          {/* Technical Search Input */}
          <div className="relative hidden md:flex items-center">
            <span className="material-symbols-outlined text-[#5B5B5B] text-base absolute left-2.5 pointer-events-none">
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter plot ID or typologies..."
              className="pl-8 pr-12 py-1.5 w-64 bg-[#EAE0CE]/60 border border-[#212121]/20 text-xs font-mono text-[#212121] placeholder-[#9C9C9C] focus:outline-none focus:border-[#3B60C5] focus:bg-[#FFFBF3] transition-colors"
            />
            <span className="absolute right-2 font-mono text-[10px] text-[#5B5B5B] border border-[#212121]/15 px-1 bg-[#FDF8F0]">
              ⌘K
            </span>
          </div>

          {/* Utility Icon Buttons */}
          <div className="flex items-center border-x border-[#212121]/15 px-3 space-x-1">
            <button
              type="button"
              onClick={() => setViewMode((v) => (v === "grid" ? "list" : "grid"))}
              className="p-1.5 text-[#5B5B5B] hover:text-[#212121] hover:bg-[#EAE0CE]/50 transition-colors cursor-pointer"
              title="Layer Visibility & View Toggle"
            >
              <span className="material-symbols-outlined text-[18px]">layers</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setSortBy((prev) => (prev === "recent" ? "area-desc" : "recent"))
              }
              className="p-1.5 text-[#5B5B5B] hover:text-[#212121] hover:bg-[#EAE0CE]/50 transition-colors cursor-pointer"
              title="Unit & Grid Settings"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </button>
            <Link
              href="/studio?mode=3d"
              className="p-1.5 text-[#5B5B5B] hover:text-[#212121] hover:bg-[#EAE0CE]/50 transition-colors"
              title="3D Massing Engine"
            >
              <span className="material-symbols-outlined text-[18px]">
                deployed_code
              </span>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() =>
                triggerToast("EXPORTING IFC 4.3 BUNDLE // 5 ACTIVE PLOTS QUEUED...")
              }
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#EAE0CE] border border-[#212121]/30 text-[#212121] font-mono text-xs uppercase tracking-wider hover:bg-[#212121] hover:text-[#FFFBF3] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>Export IFC</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/studio")}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#3B60C5] text-[#FFFBF3] border border-[#212121] font-mono text-xs uppercase tracking-wider shadow-[2px_2px_0px_#212121] hover:bg-[#EC633D] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">bolt</span>
              <span>Commit AI</span>
            </button>
          </div>

          {/* Architect Avatar */}
          <Link
            href="/sign-in"
            title={
              currentUser
                ? `${currentUser.name} (${currentUser.role})`
                : "Architect Workstation Profile"
            }
            className="w-8 h-8 border border-[#212121] bg-[#EAE0CE] flex items-center justify-center overflow-hidden hover:border-[#3B60C5] transition-colors"
          >
            <span className="font-mono text-xs font-bold text-[#212121]">
              {currentUser ? currentUser.avatar : "MR"}
            </span>
          </Link>
        </div>
      </header>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-[#212121]/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />
          <aside className="relative w-[280px] max-w-[85vw] bg-[#EAE0CE] border-r border-[#212121] z-50 flex flex-col justify-between h-full overflow-y-auto shadow-2xl">
            <div>
              {/* Workspace ID & Close Button */}
              <div className="p-4 border-b border-[#212121]/15 flex items-center justify-between bg-[#FDF8F0]">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#5B5B5B]">
                    WORKSPACE 01
                  </div>
                  <div className="font-mono text-xs font-bold text-[#212121] tracking-tight mt-0.5">
                    ARCH-504
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-[#212121] hover:bg-[#EAE0CE] border border-[#212121]/20 cursor-pointer"
                  aria-label="Close drawer"
                >
                  <span className="material-symbols-outlined text-[18px] block">close</span>
                </button>
              </div>

              {/* Credits & AI Synthesis CTA */}
              <div className="p-4 border-b border-[#212121]/15 bg-[#FDF8F0]/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#5B5B5B] uppercase">Allocation</span>
                  <span className="font-mono text-[10px] font-semibold text-[#EC633D] uppercase border border-[#EC633D] bg-[#EC633D]/10 px-2 py-0.5">
                    1,000 Credits
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    setCreatePreset("ai");
                    setShowCreateModal(true);
                  }}
                  className="w-full py-2.5 px-3 bg-[#3B60C5] text-[#FFFBF3] border border-[#212121] shadow-[2px_2px_0px_#212121] font-mono text-xs uppercase tracking-wider font-medium flex items-center justify-between cursor-pointer"
                >
                  <span>Synthesize BIM</span>
                  <span className="material-symbols-outlined text-[16px]">magic_button</span>
                </button>
              </div>

              {/* Navigation Menu */}
              <div className="py-2">
                <div className="px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#5B5B5B]">
                  STUDIO PIPELINE
                </div>
                <nav className="space-y-0.5">
                  {[
                    { id: "Drafting", icon: "architecture", badge: "ACTIVE" },
                    { id: "Components", icon: "grid_view" },
                    { id: "Assemblies", icon: "layers" },
                    { id: "Annotations", icon: "straighten" },
                    { id: "Structural", icon: "foundation" },
                    { id: "Copilot AI", icon: "auto_awesome", dot: true },
                  ].map((item) => {
                    const isActive = activeSideNav === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveSideNav(item.id);
                          setMobileSidebarOpen(false);
                          if (item.id === "Copilot AI") {
                            router.push("/studio");
                          }
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                          isActive
                            ? "bg-[#FDF8F0] text-[#212121] font-semibold border-l-2 border-[#EC633D]"
                            : "text-[#5B5B5B] hover:bg-[#FDF8F0]/50 hover:text-[#212121]"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              isActive
                                ? "text-[#3B60C5]"
                                : item.dot
                                ? "text-[#EC633D]"
                                : ""
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span>{item.id}</span>
                        </div>
                        {item.badge && (
                          <span className="font-mono text-[10px] text-[#3B60C5]">
                            {item.badge}
                          </span>
                        )}
                        {item.dot && (
                          <span className="w-1.5 h-1.5 bg-[#EC633D] inline-block" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Bottom Actions & Coordinates */}
            <div className="border-t border-[#212121]/15 bg-[#EAE0CE]">
              <div className="py-2 border-b border-[#212121]/15">
                <button
                  type="button"
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    router.push("/studio");
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-[#5B5B5B] hover:bg-[#FDF8F0]/50 hover:text-[#212121] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Parameters</span>
                </button>
              </div>
              <div className="p-4 bg-[#FDF8F0]/50 font-mono text-[10px] text-[#5B5B5B] space-y-1">
                <div className="flex justify-between">
                  <span>DATUM:</span>
                  <span className="text-[#212121] font-semibold">WGS84 / UTM</span>
                </div>
                <div className="flex justify-between">
                  <span>LAT: 37.7749° N</span>
                  <span>LON: -122.4194° W</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Workspace Container (Sidebar + Main Canvas) */}
      <div className="flex pt-14 min-h-screen">
        {/* SideNavBar: Fixed Left Architectural Inspector & Navigation */}
        <aside className="fixed left-0 top-14 bottom-0 w-64 bg-[#EAE0CE] border-r border-[#212121]/15 z-40 hidden md:flex flex-col justify-between select-none">
          {/* Top Workspace Section */}
          <div>
            {/* Workspace Identification Header */}
            <div className="p-4 border-b border-[#212121]/15 flex items-center justify-between bg-[#FDF8F0]/40 js-dash-side">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#5B5B5B]">
                  WORKSPACE 01
                </div>
                <div className="font-mono text-xs font-bold text-[#212121] tracking-tight mt-0.5">
                  ARCH-504
                </div>
              </div>
              <div className="border border-[#EC633D] bg-[#EC633D]/10 px-2 py-0.5">
                <span className="font-mono text-[10px] font-semibold text-[#EC633D] uppercase tracking-wider">
                  1,000 Credits
                </span>
              </div>
            </div>

            {/* Primary Synthesis Action */}
            <div className="p-4 border-b border-[#212121]/15 js-dash-side">
              <button
                type="button"
                onClick={() => {
                  setCreatePreset("ai");
                  setShowCreateModal(true);
                }}
                className="w-full py-2.5 px-3 bg-[#3B60C5] text-[#FFFBF3] border border-[#212121] shadow-[2px_2px_0px_#212121] hover:bg-[#EC633D] transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span className="font-mono text-xs uppercase tracking-wider font-medium">
                  Synthesize BIM
                </span>
                <span className="material-symbols-outlined text-[16px] bg-[#EC633D] group-hover:bg-[#212121] text-[#FFFBF3] p-0.5 border border-[#212121] transition-colors">
                  magic_button
                </span>
              </button>
            </div>

            {/* Navigation Menu Items */}
            <div className="py-2">
              <div className="px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#5B5B5B]">
                STUDIO PIPELINE
              </div>
              <nav className="space-y-0.5">
                {[
                  { id: "Drafting", icon: "architecture", badge: "ACTIVE" },
                  { id: "Components", icon: "grid_view" },
                  { id: "Assemblies", icon: "layers" },
                  { id: "Annotations", icon: "straighten" },
                  { id: "Structural", icon: "foundation" },
                  { id: "Copilot AI", icon: "auto_awesome", dot: true },
                ].map((item) => {
                  const isActive = activeSideNav === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSideNav(item.id);
                        if (item.id === "Copilot AI") {
                          router.push("/studio");
                        }
                      }}
                      className={`js-dash-side w-full flex items-center justify-between px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#FDF8F0] text-[#212121] font-semibold border-l-2 border-[#EC633D]"
                          : "text-[#5B5B5B] hover:bg-[#FDF8F0]/50 hover:text-[#212121]"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            isActive
                              ? "text-[#3B60C5]"
                              : item.dot
                              ? "text-[#EC633D]"
                              : ""
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span>{item.id}</span>
                      </div>
                      {item.badge && (
                        <span className="font-mono text-[10px] text-[#3B60C5]">
                          {item.badge}
                        </span>
                      )}
                      {item.dot && (
                        <span className="w-1.5 h-1.5 bg-[#EC633D] inline-block" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom System Telemetry & Links */}
          <div className="border-t border-[#212121]/15 bg-[#EAE0CE] js-dash-side">
            <div className="py-2 border-b border-[#212121]/15">
              <button
                type="button"
                onClick={() => router.push("/studio")}
                className="w-full flex items-center space-x-3 px-4 py-2 text-[#5B5B5B] hover:bg-[#FDF8F0]/50 hover:text-[#212121] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Parameters</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  triggerToast("PROJECT AUDIT PASSED // 0 CLASHES ACROSS 5 ACTIVE PLOTS")
                }
                className="w-full flex items-center space-x-3 px-4 py-2 text-[#5B5B5B] hover:bg-[#FDF8F0]/50 hover:text-[#212121] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  assignment_turned_in
                </span>
                <span>Project Audit</span>
              </button>
            </div>
            {/* Live Coordinates Readout */}
            <div className="p-4 bg-[#FDF8F0]/50 font-mono text-[10px] text-[#5B5B5B] space-y-1">
              <div className="flex justify-between">
                <span>ORIGIN DATUM:</span>
                <span className="text-[#212121] font-semibold">WGS84 / UTM</span>
              </div>
              <div className="flex justify-between">
                <span ref={sideLatRef}>LAT: 37.7749° N</span>
                <span ref={sideLonRef}>LON: -122.4194° W</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Editorial Content Canvas */}
        <main className="flex-1 md:ml-64 min-h-[calc(100vh-3.5rem)] bg-drafting-grid flex flex-col justify-between">
          {/* Upper Content Container */}
          <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 pt-8 pb-16">
            {/* Editorial Header Zone */}
            <div className="border-b border-[#212121]/15 pb-8 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                {/* Title & Index Meta */}
                <div className="js-dash-hero">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="px-2 py-0.5 bg-[#EAE0CE] border border-[#212121]/20 font-mono text-[11px] uppercase tracking-widest text-[#212121]">
                      WORKSPACE // ARCH-504
                    </span>
                    <span className="font-mono text-[11px] text-[#5B5B5B] uppercase tracking-widest flex items-center">
                      <span className="w-2 h-2 bg-[#3B60C5] inline-block mr-1.5" />
                      AUTODESK REVIT 2026 HYBRID SYNC ACTIVE
                    </span>
                  </div>
                  <h1 className="font-headline-lg text-[#212121]">
                    Architectural Projects
                  </h1>
                  <p className="font-body-md text-[#5B5B5B] mt-2 max-w-xl">
                    Centralized repository of active schematic massing studies,
                    structural BIM iterations, and multi-plot urban typologies.
                  </p>
                </div>

                {/* Right Header Actions: New Project CTA */}
                <div className="flex flex-wrap items-center gap-4 js-dash-hero">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatePreset("ai");
                      setShowCreateModal(true);
                    }}
                    className="tactile-press inline-flex items-center bg-[#3B60C5] text-[#FFFBF3] border border-[#212121] p-1.5 pr-5 hover:bg-[#212121] transition-colors group cursor-pointer"
                  >
                    <span className="w-9 h-9 bg-[#EC633D] border border-[#212121] flex items-center justify-center mr-3.5 group-hover:bg-[#3B60C5] transition-colors">
                      <span className="material-symbols-outlined text-[#FFFBF3] text-[20px]">
                        add
                      </span>
                    </span>
                    <div className="text-left">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-[#EAE0CE]/80">
                        NEW SCHEMATIC
                      </div>
                      <div className="font-mono text-xs font-semibold uppercase tracking-wider">
                        Initiate Masterplan
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Summary Metrics Bar (3-Column Technical Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-[#212121]/20 bg-[#FDF8F0] mt-8">
                {/* Metric 01 */}
                <div className="js-metric-card p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-[#212121]/15 flex items-start justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#5B5B5B]">
                      01 // Total Area Planned
                    </div>
                    <div className="font-serif text-3xl text-[#212121] mt-1">
                      <span ref={areaCounterRef}>48,250</span>{" "}
                      <span className="font-mono text-xs text-[#5B5B5B] uppercase">
                        m² GFA
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#3B60C5] bg-[#3B60C5]/10 px-1.5 py-0.5 border border-[#3B60C5]/20">
                    +12.4% THIS QUARTER
                  </span>
                </div>

                {/* Metric 02 */}
                <div className="js-metric-card p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-[#212121]/15 flex items-start justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#5B5B5B]">
                      02 // Active Plots
                    </div>
                    <div className="font-serif text-3xl text-[#212121] mt-1">
                      <span ref={plotsCounterRef}>14</span>{" "}
                      <span className="font-mono text-xs text-[#5B5B5B] uppercase">
                        Sites Committed
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#EC633D] bg-[#EC633D]/10 px-1.5 py-0.5 border border-[#EC633D]/20">
                    4 IN AI SYNTHESIS
                  </span>
                </div>

                {/* Metric 03 */}
                <div className="js-metric-card p-4 sm:p-5 flex items-start justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#5B5B5B]">
                      03 // Team Allocation
                    </div>
                    <div className="font-serif text-3xl text-[#212121] mt-1">
                      <span ref={leadsCounterRef}>06</span>{" "}
                      <span className="font-mono text-xs text-[#5B5B5B] uppercase">
                        Leads Active
                      </span>
                    </div>
                  </div>
                  <div className="flex -space-x-1.5">
                    <span className="w-6 h-6 bg-[#EAE0CE] border border-[#212121] font-mono text-[10px] flex items-center justify-center font-semibold">
                      M.R
                    </span>
                    <span className="w-6 h-6 bg-[#3B60C5] text-[#FFFBF3] border border-[#212121] font-mono text-[10px] flex items-center justify-center font-semibold">
                      A.K
                    </span>
                    <span className="w-6 h-6 bg-[#EC633D] text-[#FFFBF3] border border-[#212121] font-mono text-[10px] flex items-center justify-center font-semibold">
                      S.V
                    </span>
                    <span className="w-6 h-6 bg-[#FDF8F0] border border-[#212121] font-mono text-[10px] flex items-center justify-center text-[#5B5B5B]">
                      +3
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter, Sort & View Engine Bar (Sticky Sub-Header) */}
            <div className="sticky top-14 z-30 bg-[#FDF8F0]/95 backdrop-blur-xs border-y border-[#212121]/20 py-3 px-4 mb-8 flex flex-wrap items-center justify-between gap-4">
              {/* Left: Category Filter Tabs */}
              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar touch-pan-x w-full sm:w-auto pb-1 sm:pb-0">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#5B5B5B] mr-2">
                  FILTER:
                </span>
                {["All", "Residential", "Commercial", "Multi-Family", "Urban"].map(
                  (cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#212121] text-[#FFFBF3]"
                            : "text-[#5B5B5B] hover:text-[#212121] hover:bg-[#EAE0CE]/60"
                        }`}
                      >
                        {cat === "All"
                          ? `All (0${projects.length})`
                          : cat}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Right: Sort Dropdown & View Switcher */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#5B5B5B]">
                    SORT BY:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#EAE0CE]/60 border border-[#212121]/20 py-1 pl-2.5 pr-7 font-mono text-xs text-[#212121] focus:outline-none focus:border-[#3B60C5] cursor-pointer"
                  >
                    <option value="recent">Recent Revision</option>
                    <option value="area-desc">Plot Area: Descending</option>
                    <option value="area-asc">Plot Area: Ascending</option>
                    <option value="lod">BIM Fidelity Level</option>
                  </select>
                </div>

                {/* Grid / List View Switcher */}
                <div className="flex items-center border border-[#212121]/20 bg-[#EAE0CE]/40">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 cursor-pointer transition-colors ${
                      viewMode === "grid"
                        ? "bg-[#212121] text-[#FFFBF3]"
                        : "text-[#5B5B5B] hover:text-[#212121]"
                    }`}
                    title="Grid Card View"
                  >
                    <span className="material-symbols-outlined text-[16px] block">
                      grid_view
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 cursor-pointer transition-colors ${
                      viewMode === "list"
                        ? "bg-[#212121] text-[#FFFBF3]"
                        : "text-[#5B5B5B] hover:text-[#212121]"
                    }`}
                    title="Index List View"
                  >
                    <span className="material-symbols-outlined text-[16px] block">
                      view_list
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Project Cards Grid OR Schedule Index List View */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map((proj) => (
                  <article
                    key={proj.id}
                    onMouseEnter={handleCardMouseEnter}
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    className="js-project-card bg-[#FDF8F0] border border-[#212121]/25 flex flex-col justify-between group hover:border-[#212121] transition-colors shadow-[4px_4px_0px_rgba(33,33,33,0.06)]"
                  >
                    <div>
                      {/* Card Top Index Header */}
                      <div className="px-4 py-2.5 bg-[#EAE0CE]/50 border-b border-[#212121]/15 flex items-center justify-between">
                        <span className="font-mono text-[11px] font-semibold text-[#212121] tracking-wider">
                          [ {proj.index} ] {proj.plotCode}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="px-1.5 py-0.5 bg-[#FDF8F0] border border-[#212121]/20 font-mono text-[10px] uppercase text-[#5B5B5B]">
                            {proj.category}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 font-mono text-[10px] uppercase font-medium flex items-center ${
                              proj.statusColor === "cobalt"
                                ? "bg-[#3B60C5]/15 border border-[#3B60C5]/30 text-[#3B60C5]"
                                : proj.statusColor === "vermilion"
                                ? "bg-[#EC633D]/15 border border-[#EC633D]/40 text-[#EC633D]"
                                : "bg-[#EAE0CE] border border-[#212121]/25 text-[#212121]"
                            }`}
                          >
                            {proj.statusPulse && (
                              <span className="w-1.5 h-1.5 bg-[#EC633D] mr-1 animate-pulse" />
                            )}
                            {proj.statusLabel}
                          </span>
                        </div>
                      </div>

                      {/* Architectural Plan / Massing Preview Window */}
                      <div
                        onClick={() => router.push(`/studio?project=${proj.id}`)}
                        className="relative h-52 bg-[#EAE0CE]/30 border-b border-[#212121]/15 overflow-hidden p-4 flex items-center justify-center cursor-pointer"
                      >
                        <img
                          src={proj.image}
                          alt={proj.imageAlt}
                          className={`js-card-img w-full h-full object-cover mix-blend-multiply transition-opacity duration-300 ${
                            previewModes[proj.id] === "3d" ? "opacity-20" : "opacity-90 group-hover:opacity-20"
                          }`}
                        />
                        <img
                          src={proj.renderImage}
                          alt={proj.imageAlt}
                          className={`js-card-img absolute inset-0 w-full h-full object-cover transition-opacity duration-300 p-3 ${
                            previewModes[proj.id] === "3d" ? "opacity-95" : "opacity-0 group-hover:opacity-95"
                          }`}
                        />
                        {/* Technical Corner Overlay Markers */}
                        <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-[#212121]/50 pointer-events-none" />
                        <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-[#212121]/50 pointer-events-none" />
                        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-[#212121]/50 pointer-events-none" />
                        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-[#212121]/50 pointer-events-none" />
                        <div className="absolute bottom-2.5 left-3 bg-[#FDF8F0]/90 border border-[#212121]/20 px-2 py-0.5 font-mono text-[10px] text-[#212121] pointer-events-none">
                          ZONING: {proj.zoning} // {proj.levels}
                        </div>

                        {/* Interactive 2D / 3D Mode Toggle Pill for Touch & Click */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2.5 right-3 z-10 flex items-center bg-[#FDF8F0] border border-[#212121] p-0.5 shadow-xs"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewModes((prev) => ({ ...prev, [proj.id]: "2d" }));
                            }}
                            className={`px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors cursor-pointer touch-manipulation ${
                              (!previewModes[proj.id] || previewModes[proj.id] === "2d")
                                ? "bg-[#212121] text-[#FFFBF3]"
                                : "text-[#5B5B5B] hover:text-[#212121]"
                            }`}
                          >
                            2D CAD
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewModes((prev) => ({ ...prev, [proj.id]: "3d" }));
                            }}
                            className={`px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors cursor-pointer touch-manipulation ${
                              previewModes[proj.id] === "3d"
                                ? "bg-[#EC633D] text-[#FFFBF3]"
                                : "text-[#5B5B5B] hover:text-[#212121]"
                            }`}
                          >
                            3D BIM
                          </button>
                        </div>
                      </div>

                      {/* Project Title & Description */}
                      <div className="p-5">
                        <h2 className="font-headline-md text-[#212121] group-hover:text-[#3B60C5] transition-colors">
                          {proj.title}
                        </h2>
                        <p className="font-body-md text-[#5B5B5B] mt-1 line-clamp-1">
                          {proj.subtitle}
                        </p>

                        {/* Technical Metadata Matrix */}
                        <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-dashed border-[#212121]/20 font-mono text-xs">
                          <div>
                            <div className="text-[10px] text-[#9C9C9C] uppercase">
                              PLOT AREA
                            </div>
                            <div className="text-[#212121] font-semibold mt-0.5">
                              {proj.area}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-[#9C9C9C] uppercase">
                              FIDELITY
                            </div>
                            <div className="text-[#212121] font-semibold mt-0.5">
                              {proj.lod}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-[#9C9C9C] uppercase">
                              UPDATED
                            </div>
                            <div className="text-[#5B5B5B] mt-0.5">{proj.updated}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Action Bar */}
                    <div className="px-5 py-3 bg-[#EAE0CE]/30 border-t border-[#212121]/15 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/studio?project=${proj.id}&mode=3d`)}
                          className="p-1 text-[#5B5B5B] hover:text-[#212121] transition-colors cursor-pointer"
                          title="3D Massing View"
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            view_in_ar
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            triggerToast(`REVISION HISTORY FOR [${proj.title.toUpperCase()}] LOADED`)
                          }
                          className="p-1 text-[#5B5B5B] hover:text-[#212121] transition-colors cursor-pointer"
                          title="Revision History"
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            history
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            triggerToast(`EXPORTING ${proj.plotCode} DWG / IFC PACKAGE...`)
                          }
                          className="p-1 text-[#5B5B5B] hover:text-[#212121] transition-colors cursor-pointer"
                          title="Export DWG/IFC"
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            ios_share
                          </span>
                        </button>
                      </div>
                      <Link
                        href={`/studio?project=${proj.id}`}
                        className="inline-flex items-center space-x-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#212121] group-hover:text-[#3B60C5] transition-colors"
                      >
                        <span>{proj.ctaLabel}</span>
                        <span className="w-5 h-5 bg-[#212121] text-[#FFFBF3] group-hover:bg-[#EC633D] flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-[13px]">
                            north_east
                          </span>
                        </span>
                      </Link>
                    </div>
                  </article>
                ))}

                {/* CARD 06: New Project / Quick Template Initiation Card */}
                <article className="js-project-card bg-[#EAE0CE]/40 border border-dashed border-[#212121]/40 flex flex-col justify-between p-6 hover:bg-[#EAE0CE]/70 hover:border-[#3B60C5] transition-colors">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#212121]/15">
                      <span className="font-mono text-[11px] font-semibold text-[#5B5B5B] tracking-wider">
                        [ 0{projects.length + 1} ] SLOT // AVAILABLE
                      </span>
                      <span className="w-2 h-2 bg-[#EC633D]" />
                    </div>

                    <div className="py-8 text-center">
                      <div className="w-12 h-12 mx-auto bg-[#FDF8F0] border border-[#212121] shadow-[2px_2px_0px_#212121] flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[#3B60C5] text-[24px]">
                          Note_Add
                        </span>
                      </div>
                      <h3 className="font-headline-md text-[#212121]">
                        Initiate New Plot
                      </h3>
                      <p className="font-body-md text-[#5B5B5B] mt-2 max-w-xs mx-auto">
                        Start from an empty orthographic grid, import DXF/Revit
                        site boundaries, or prompt AI massing.
                      </p>
                    </div>
                  </div>

                  {/* Quick Start Preset Buttons */}
                  <div className="space-y-2 pt-4 border-t border-[#212121]/15">
                    <button
                      type="button"
                      onClick={() => {
                        setCreatePreset("ai");
                        setShowCreateModal(true);
                      }}
                      className="w-full py-2.5 px-4 bg-[#3B60C5] text-[#FFFBF3] border border-[#212121] shadow-[2px_2px_0px_#212121] font-mono text-xs uppercase tracking-wider font-medium hover:bg-[#212121] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>AI Prompted Massing</span>
                      <span className="material-symbols-outlined text-[15px]">
                        auto_awesome
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreatePreset("blank");
                        setShowCreateModal(true);
                      }}
                      className="w-full py-2 px-4 bg-[#FDF8F0] text-[#212121] border border-[#212121]/30 font-mono text-xs uppercase tracking-wider hover:border-[#212121] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Blank Architectural Canvas</span>
                      <span className="material-symbols-outlined text-[15px]">
                        grid_on
                      </span>
                    </button>
                  </div>
                </article>
              </div>
            ) : (
              /* Architectural Schedule Index List View */
              <div className="bg-[#FDF8F0] border border-[#212121]/25 shadow-[4px_4px_0px_rgba(33,33,33,0.06)] overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EAE0CE] border-b border-[#212121]/20 font-mono text-[10px] uppercase tracking-widest text-[#5B5B5B]">
                      <th className="py-3 px-4">INDEX // PLOT</th>
                      <th className="py-3 px-4">PROJECT DESIGNATION</th>
                      <th className="py-3 px-4">TYPOLOGY</th>
                      <th className="py-3 px-4">ZONING</th>
                      <th className="py-3 px-4">GFA AREA</th>
                      <th className="py-3 px-4">FIDELITY</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#212121]/15 font-mono text-xs">
                    {filteredProjects.map((proj) => (
                      <tr
                        key={proj.id}
                        onClick={() => router.push(`/studio?project=${proj.id}`)}
                        className="js-project-card hover:bg-[#EAE0CE]/40 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-semibold text-[#212121]">
                          [{proj.index}] {proj.plotCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-serif text-lg text-[#212121]">
                            {proj.title}
                          </div>
                          <div className="font-sans text-xs text-[#5B5B5B]">
                            {proj.subtitle}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#5B5B5B] uppercase">
                          {proj.category}
                        </td>
                        <td className="py-3.5 px-4 text-[#212121]">
                          {proj.zoning} // {proj.levels}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#212121]">
                          {proj.area}
                        </td>
                        <td className="py-3.5 px-4 text-[#3B60C5] font-semibold">
                          {proj.lod}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-[#EAE0CE] border border-[#212121]/20 text-[10px]">
                            {proj.statusLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center space-x-1 text-[#3B60C5] font-semibold uppercase">
                            <span>Open</span>
                            <span className="material-symbols-outlined text-[14px]">
                              north_east
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Editorial Essay Pull-Quote Strip (Unseen Studio Manifesto Accent) */}
            <div className="js-essay-strip mt-16 border border-[#212121]/20 bg-[#EAE0CE]/60 p-8 sm:p-10 relative">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#EC633D] mb-2">
                    AN OPEN LETTER // FOR PRACTICE
                  </div>
                  <blockquote className="font-serif italic text-2xl sm:text-3xl text-[#212121] leading-snug">
                    &ldquo;Software should behave like tracing paper &mdash; fluid,
                    immediate, and responsive to the architect&apos;s hand &mdash; while
                    silently resolving structural geometry beneath the surface.&rdquo;
                  </blockquote>
                </div>
                <div className="flex items-center space-x-4 shrink-0">
                  <Link
                    href="/about"
                    className="px-4 py-2.5 bg-[#FDF8F0] border border-[#212121] font-mono text-xs uppercase tracking-wider text-[#212121] hover:bg-[#212121] hover:text-[#FFFBF3] transition-colors shadow-[2px_2px_0px_#212121]"
                  >
                    Read Manifesto
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom BIM Status Footer */}
          <footer className="border-t border-[#212121]/15 bg-[#FDF8F0] px-6 sm:px-10 py-3 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-[#5B5B5B]">
            <div className="flex items-center space-x-6">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-[#3B60C5] inline-block mr-2" />
                ENGINE STATUS: ONLINE (14ms)
              </span>
              <span className="hidden sm:inline">GRID: 100mm INCREMENT</span>
              <span className="hidden md:inline">SCALE: 1:100 @ A1</span>
            </div>
            <div className="flex items-center space-x-6">
              <span ref={footerCoordsRef}>
                X: 37.7749 // Y: -122.4194 // Z: 0.00m
              </span>
              <span className="text-[#212121] font-semibold">
                ILLOCA STUDIO v2.4
              </span>
            </div>
          </footer>
        </main>
      </div>

      {/* Modal: Initiate Masterplan / AI Prompted Massing */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[80] bg-[#212121]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDF8F0] border border-[#212121] shadow-[6px_6px_0px_#212121] w-full max-w-lg">
            <div className="px-5 py-3.5 bg-[#EAE0CE] border-b border-[#212121]/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#EC633D]" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#212121]">
                  {createPreset === "ai"
                    ? "SYNTHESIZE NEW AI MASTERPLAN"
                    : "INITIALIZE BLANK ORTHOGRAPHIC PLOT"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="font-mono text-xs text-[#5B5B5B] hover:text-[#212121] cursor-pointer"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleCreatePlotSubmit} className="p-6 space-y-4">
              <div className="flex items-center space-x-2 bg-[#EAE0CE]/50 p-1 border border-[#212121]/15">
                <button
                  type="button"
                  onClick={() => setCreatePreset("ai")}
                  className={`flex-1 py-1.5 font-mono text-[11px] uppercase tracking-wider cursor-pointer ${
                    createPreset === "ai"
                      ? "bg-[#3B60C5] text-[#FFFBF3] font-semibold"
                      : "text-[#5B5B5B]"
                  }`}
                >
                  AI Prompted Massing
                </button>
                <button
                  type="button"
                  onClick={() => setCreatePreset("blank")}
                  className={`flex-1 py-1.5 font-mono text-[11px] uppercase tracking-wider cursor-pointer ${
                    createPreset === "blank"
                      ? "bg-[#212121] text-[#FFFBF3] font-semibold"
                      : "text-[#5B5B5B]"
                  }`}
                >
                  Blank Orthographic Grid
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#212121] font-semibold block">
                  Project Designation
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full h-10 px-3 bg-[#FFFBF3] border border-[#212121]/30 font-sans text-sm text-[#212121] focus:outline-none focus:border-[#3B60C5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#212121] font-semibold block">
                    Typology
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(
                        e.target.value as ArchitecturalProject["category"]
                      )
                    }
                    className="w-full h-10 px-2.5 bg-[#FFFBF3] border border-[#212121]/30 font-mono text-xs text-[#212121]"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Multi-Family">Multi-Family</option>
                    <option value="Urban">Urban</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#212121] font-semibold block">
                    Target GFA (m²)
                  </label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FFFBF3] border border-[#212121]/30 font-mono text-xs text-[#212121]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#212121] font-semibold block">
                    Zoning Code
                  </label>
                  <input
                    type="text"
                    value={newZoning}
                    onChange={(e) => setNewZoning(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FFFBF3] border border-[#212121]/30 font-mono text-xs text-[#212121]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#212121] font-semibold block">
                    Vertical Envelope
                  </label>
                  <input
                    type="text"
                    value={newLevels}
                    onChange={(e) => setNewLevels(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FFFBF3] border border-[#212121]/30 font-mono text-xs text-[#212121]"
                  />
                </div>
              </div>

              {createPreset === "ai" && (
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#212121] font-semibold block">
                    Spatial &amp; Structural Intent Prompt
                  </label>
                  <textarea
                    rows={3}
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    className="w-full p-3 bg-[#FFFBF3] border border-[#212121]/30 font-sans text-xs text-[#212121] focus:outline-none focus:border-[#3B60C5]"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-[#212121]/15">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#212121]/30 font-mono text-xs uppercase text-[#5B5B5B] hover:text-[#212121] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3B60C5] text-[#FFFBF3] border border-[#212121] shadow-[2px_2px_0px_#212121] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#EC633D] transition-colors cursor-pointer"
                >
                  Commission Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
