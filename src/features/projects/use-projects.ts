"use client";
import { useToast } from "@/shared/hooks/use-toast";
import { INITIAL_PROJECTS } from "./data/sample-projects";
import { createProject,selectProjects } from "./model/operations";
import { ArchitecturalProject } from "./model/types";

import { useAuth } from "@/features/auth/client";
import gsap from "@/shared/animation";
import { ScrollTrigger } from "@/shared/animation";
import Lenis from "lenis";
import { useRouter } from "next/navigation";
import React,{ useEffect,useLayoutEffect,useMemo,useRef,useState } from "react";


const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const canHover = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

export function useProjects() {
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
  const cardTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const cardTouchRafRef = useRef<number | null>(null);

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
  const { toastMessage, setToastMessage, triggerToast } = useToast(3800);


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
  const filteredProjects = useMemo(() => selectProjects(projects, { selectedCategory, searchQuery, sortBy }), [projects, selectedCategory, searchQuery, sortBy]);

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

  // Touch drag handler for mobile project card 3D tilt (smooth, non-blocking via rAF)
  const handleCardTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    cardTouchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleCardTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    if (!touch || !cardTouchStartRef.current) return;
    const dx = Math.abs(touch.clientX - cardTouchStartRef.current.x);
    const dy = Math.abs(touch.clientY - cardTouchStartRef.current.y);

    // If scrolling vertically, do not tilt
    if (dy > dx * 1.3 && dy > 12) return;

    const card = e.currentTarget as HTMLElement & {
      _rect?: DOMRect;
      _imgs?: NodeListOf<Element>;
    };

    if (cardTouchRafRef.current) cancelAnimationFrame(cardTouchRafRef.current);
    cardTouchRafRef.current = requestAnimationFrame(() => {
      const rect = card._rect || (card._rect = card.getBoundingClientRect());
      const relX = (touch.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
      const relY = (touch.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;

      gsap.to(card, {
        rotateY: relX * 4,
        rotateX: -relY * 4,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto",
        force3D: "auto",
        transformPerspective: 1000,
      });

      const imgs = card._imgs || card.querySelectorAll(".js-card-img");
      if (imgs.length) {
        gsap.to(imgs, {
          x: relX * -8,
          y: relY * -8,
          duration: 0.22,
          ease: "power2.out",
          overwrite: "auto",
          force3D: "auto",
        });
      }
    });
  };

  const handleCardTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    cardTouchStartRef.current = null;
    if (cardTouchRafRef.current) cancelAnimationFrame(cardTouchRafRef.current);
    const card = e.currentTarget as HTMLElement & {
      _imgs?: NodeListOf<Element>;
    };
    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
      force3D: "auto",
    });
    const imgs = card._imgs || card.querySelectorAll(".js-card-img");
    if (imgs.length) {
      gsap.to(imgs, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
        force3D: "auto",
      });
    }
  };

  const handleCreatePlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createProject({newTitle,newArea,newCategory,newZoning,newLevels,newPrompt,createPreset}, projects.length, INITIAL_PROJECTS[0], Date.now());

    setProjects((prev) => [created, ...prev]);
    setShowCreateModal(false);
    triggerToast(`PLOT [${created.plotCode}] INITIALIZED // READY FOR CANVAS`);
  };
  return { router, currentUser, rootRef, searchInputRef, areaCounterRef, plotsCounterRef, leadsCounterRef, sideLatRef, sideLonRef, footerCoordsRef, projects, selectedCategory, setSelectedCategory, sortBy, setSortBy, viewMode, setViewMode, searchQuery, setSearchQuery, activeTopNav, setActiveTopNav, activeSideNav, setActiveSideNav, mobileSidebarOpen, setMobileSidebarOpen, previewModes, setPreviewModes, showCreateModal, setShowCreateModal, createPreset, setCreatePreset, newTitle, setNewTitle, newCategory, setNewCategory, newArea, setNewArea, newZoning, setNewZoning, newLevels, setNewLevels, newPrompt, setNewPrompt, toastMessage, setToastMessage, triggerToast, filteredProjects, handleMouseMove, handleCardMouseEnter, handleCardMouseMove, handleCardMouseLeave, handleCardTouchStart, handleCardTouchMove, handleCardTouchEnd, handleCreatePlotSubmit };
}
