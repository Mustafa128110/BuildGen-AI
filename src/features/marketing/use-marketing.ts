"use client";

import gsap from "@/shared/animation";
import { ScrollTrigger } from "@/shared/animation";
import Lenis from "lenis";
import { useEffect,useRef,useState } from "react";

export function useMarketing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [cookieDismissed, setCookieDismissed] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const coordXRef = useRef<HTMLSpanElement>(null);
  const coordYRef = useRef<HTMLSpanElement>(null);
  const coordsContainerRef = useRef<HTMLDivElement>(null);
  const emailContainerRef = useRef<HTMLDivElement>(null);
  const navBorderRectRef = useRef<SVGRectElement>(null);

  const heroVideoWrapRef = useRef<HTMLDivElement>(null);
  const floatingBlocksContainerRef = useRef<HTMLDivElement>(null);
  const blueprintMouseWrapRef = useRef<HTMLDivElement>(null);

  const featuresTimingRef = useRef<HTMLDivElement>(null);
  const featuresSheetRef = useRef<HTMLDivElement>(null);
  const workTimingRef = useRef<HTMLDivElement>(null);
  const workSheetRef = useRef<HTMLDivElement>(null);
  const pricingTimingRef = useRef<HTMLDivElement>(null);
  const pricingSheetRef = useRef<HTMLDivElement>(null);
  const faqsTimingRef = useRef<HTMLDivElement>(null);
  const faqsSheetRef = useRef<HTMLDivElement>(null);
  const signupTimingRef = useRef<HTMLDivElement>(null);
  const signupSheetRef = useRef<HTMLDivElement>(null);
  const footerRevealRef = useRef<HTMLDivElement>(null);
  const footerCardRef = useRef<HTMLDivElement>(null);
  const blueprintSvgRef = useRef<SVGSVGElement>(null);

  // Zero-re-render mouse coordinate tracking + 3D mouse-triggered parallax/tilt (matching /about)
  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (navBorderRectRef.current) {
      gsap.fromTo(
        navBorderRectRef.current,
        { strokeDasharray: "310%", strokeDashoffset: "310%" },
        { strokeDashoffset: "0%", duration: 1.2, ease: "expo.out" }
      );
    }

    const heroX = heroVideoWrapRef.current
      ? gsap.quickTo(heroVideoWrapRef.current, "x", {
          duration: 0.24,
          ease: "expo.out",
        })
      : null;
    const heroY = heroVideoWrapRef.current
      ? gsap.quickTo(heroVideoWrapRef.current, "y", {
          duration: 0.24,
          ease: "expo.out",
        })
      : null;
    const heroRotX = heroVideoWrapRef.current
      ? gsap.quickTo(heroVideoWrapRef.current, "rotationX", {
          duration: 0.24,
          ease: "expo.out",
        })
      : null;
    const heroRotY = heroVideoWrapRef.current
      ? gsap.quickTo(heroVideoWrapRef.current, "rotationY", {
          duration: 0.24,
          ease: "expo.out",
        })
      : null;

    const blocksX = floatingBlocksContainerRef.current
      ? gsap.quickTo(floatingBlocksContainerRef.current, "x", {
          duration: 0.28,
          ease: "expo.out",
        })
      : null;
    const blocksY = floatingBlocksContainerRef.current
      ? gsap.quickTo(floatingBlocksContainerRef.current, "y", {
          duration: 0.28,
          ease: "expo.out",
        })
      : null;
    const blocksRotX = floatingBlocksContainerRef.current
      ? gsap.quickTo(floatingBlocksContainerRef.current, "rotationX", {
          duration: 0.28,
          ease: "expo.out",
        })
      : null;
    const blocksRotY = floatingBlocksContainerRef.current
      ? gsap.quickTo(floatingBlocksContainerRef.current, "rotationY", {
          duration: 0.28,
          ease: "expo.out",
        })
      : null;

    const bpX = blueprintMouseWrapRef.current
      ? gsap.quickTo(blueprintMouseWrapRef.current, "x", {
          duration: 0.28,
          ease: "expo.out",
        })
      : null;
    const bpY = blueprintMouseWrapRef.current
      ? gsap.quickTo(blueprintMouseWrapRef.current, "y", {
          duration: 0.28,
          ease: "expo.out",
        })
      : null;
    const bpRotX = blueprintMouseWrapRef.current
      ? gsap.quickTo(blueprintMouseWrapRef.current, "rotationX", {
          duration: 0.28,
          ease: "expo.out",
        })
      : null;
    const bpRotY = blueprintMouseWrapRef.current
      ? gsap.quickTo(blueprintMouseWrapRef.current, "rotationY", {
          duration: 0.28,
          ease: "expo.out",
        })
      : null;

    let vw = Math.max(window.innerWidth, 1);
    let vh = Math.max(window.innerHeight, 1);
    const onResize = () => {
      vw = Math.max(window.innerWidth, 1);
      vh = Math.max(window.innerHeight, 1);
    };

    const onMove = (e: PointerEvent) => {
      if (coordXRef.current) {
        coordXRef.current.textContent = e.clientX.toFixed(2).padStart(4, "0");
      }
      if (coordYRef.current) {
        coordYRef.current.textContent = e.clientY.toFixed(2).padStart(4, "0");
      }

      const nx = (e.clientX / vw) * 2 - 1;
      const ny = (e.clientY / vh) * 2 - 1;

      heroX?.(nx * 14);
      heroY?.(ny * 10);
      heroRotY?.(nx * 3.5);
      heroRotX?.(-ny * 2.8);

      blocksX?.(-nx * 26);
      blocksY?.(-ny * 18);
      blocksRotY?.(nx * 6);
      blocksRotX?.(-ny * 4.5);

      bpX?.(-nx * 24);
      bpY?.(-ny * 16);
      bpRotY?.(nx * 5);
      bpRotX?.(-ny * 3.5);
    };

    // Touch-to-tilt with rAF (silky smooth, non-blocking via passive listeners)
    let touchRaf: number | null = null;
    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const dx = Math.abs(t.clientX - touchStartX);
      const dy = Math.abs(t.clientY - touchStartY);
      if (dy > dx * 1.4 && dy > 14) return;

      if (touchRaf) cancelAnimationFrame(touchRaf);
      touchRaf = requestAnimationFrame(() => {
        if (coordXRef.current) {
          coordXRef.current.textContent = t.clientX.toFixed(2).padStart(4, "0");
        }
        if (coordYRef.current) {
          coordYRef.current.textContent = t.clientY.toFixed(2).padStart(4, "0");
        }

        const nx = (t.clientX / vw) * 2 - 1;
        const ny = (t.clientY / vh) * 2 - 1;

        heroX?.(nx * 7);
        heroY?.(ny * 5);
        heroRotY?.(nx * 2);
        heroRotX?.(-ny * 1.6);

        blocksX?.(-nx * 12);
        blocksY?.(-ny * 8);
        blocksRotY?.(nx * 3);
        blocksRotX?.(-ny * 2.2);

        bpX?.(-nx * 10);
        bpY?.(-ny * 7);
        bpRotY?.(nx * 2.5);
        bpRotX?.(-ny * 1.8);
      });
    };

    const onTouchEnd = () => {
      if (touchRaf) cancelAnimationFrame(touchRaf);
      heroX?.(0);
      heroY?.(0);
      heroRotY?.(0);
      heroRotX?.(0);
      blocksX?.(0);
      blocksY?.(0);
      blocksRotY?.(0);
      blocksRotX?.(0);
      bpX?.(0);
      bpY?.(0);
      bpRotY?.(0);
      bpRotX?.(0);
    };

    window.addEventListener("resize", onResize, { passive: true });
    if (!isTouch) {
      window.addEventListener("pointermove", onMove, { passive: true });
    } else {
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
      window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    }
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      if (touchRaf) cancelAnimationFrame(touchRaf);
    };
  }, []);

  // Interactive 3D magnetic tilt & lift on Feature cards, Pricing cards, and Roadmap chips
  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(".feature-card, .paper-card")
    );
    const chips = Array.from(
      document.querySelectorAll<HTMLElement>(".roadmap-chip")
    );
    const cleanups: Array<() => void> = [];

    cards.forEach((card) => {
      const qx = gsap.quickTo(card, "x", { duration: 0.18, ease: "expo.out" });
      const qy = gsap.quickTo(card, "y", { duration: 0.18, ease: "expo.out" });
      const qRotX = gsap.quickTo(card, "rotationX", {
        duration: 0.18,
        ease: "expo.out",
      });
      const qRotY = gsap.quickTo(card, "rotationY", {
        duration: 0.18,
        ease: "expo.out",
      });
      const qScale = gsap.quickTo(card, "scale", {
        duration: 0.18,
        ease: "expo.out",
      });

      let rect = card.getBoundingClientRect();
      const onEnter = () => {
        rect = card.getBoundingClientRect();
        qScale(1.015);
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        const rx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
        const ry = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
        qx(rx * 6);
        qy(ry * 5 - 4);
        qRotY(rx * 4);
        qRotX(-ry * 3.5);
      };
      const onLeave = () => {
        qx(0);
        qy(0);
        qRotX(0);
        qRotY(0);
        qScale(1);
      };

      card.addEventListener("pointerenter", onEnter, { passive: true });
      card.addEventListener("pointermove", onMove, { passive: true });
      card.addEventListener("pointerleave", onLeave, { passive: true });
      cleanups.push(() => {
        card.removeEventListener("pointerenter", onEnter);
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave);
      });

      // Touch tilt on mobile/tablets with rAF & scroll detection
      if (isTouch) {
        let tStartX = 0;
        let tStartY = 0;
        let tRaf: number | null = null;

        const onTouchStart = (e: TouchEvent) => {
          const t = e.touches[0];
          if (!t) return;
          rect = card.getBoundingClientRect();
          tStartX = t.clientX;
          tStartY = t.clientY;
          qScale(1.012);
        };

        const onTouchMove = (e: TouchEvent) => {
          const t = e.touches[0];
          if (!t) return;
          const dx = Math.abs(t.clientX - tStartX);
          const dy = Math.abs(t.clientY - tStartY);
          if (dy > dx * 1.3 && dy > 10) return;

          if (tRaf) cancelAnimationFrame(tRaf);
          tRaf = requestAnimationFrame(() => {
            const rx = ((t.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
            const ry = ((t.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
            qRotY(rx * 3);
            qRotX(-ry * 2.5);
          });
        };

        const onTouchEnd = () => {
          if (tRaf) cancelAnimationFrame(tRaf);
          onLeave();
        };

        card.addEventListener("touchstart", onTouchStart, { passive: true });
        card.addEventListener("touchmove", onTouchMove, { passive: true });
        card.addEventListener("touchend", onTouchEnd, { passive: true });
        card.addEventListener("touchcancel", onTouchEnd, { passive: true });
        cleanups.push(() => {
          card.removeEventListener("touchstart", onTouchStart);
          card.removeEventListener("touchmove", onTouchMove);
          card.removeEventListener("touchend", onTouchEnd);
          card.removeEventListener("touchcancel", onTouchEnd);
        });
      }
    });

    chips.forEach((chip) => {
      const onEnter = () => {
        gsap.to(chip, {
          y: -4,
          scale: 1.05,
          backgroundColor: "rgba(59, 96, 197, 0.32)",
          borderColor: "#EADFC9",
          color: "#FFFBF3",
          duration: 0.18,
          ease: "expo.out",
          overwrite: true,
          force3D: "auto",
        });
      };
      const onLeave = () => {
        gsap.to(chip, {
          y: 0,
          scale: 1,
          backgroundColor: "rgba(8, 19, 40, 0.18)",
          borderColor: "#89857b",
          color: "#CBC7BE",
          duration: 0.18,
          ease: "expo.out",
          overwrite: true,
          force3D: "auto",
        });
      };
      chip.addEventListener("pointerenter", onEnter, { passive: true });
      chip.addEventListener("pointerleave", onLeave, { passive: true });
      cleanups.push(() => {
        chip.removeEventListener("pointerenter", onEnter);
        chip.removeEventListener("pointerleave", onLeave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Lenis smooth scroll + GSAP ScrollTrigger section horizontal leveling
  useEffect(() => {

    const lenis = new Lenis({
      lerp: 0.13,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);

    const ctx = gsap.context(() => {
      // 1. Features Sheet: starts tilted -5deg at bottom, levels to 0deg as header enters reading zone
      if (featuresTimingRef.current && featuresSheetRef.current) {
        gsap.fromTo(
          featuresSheetRef.current,
          { rotation: -5, force3D: "auto" },
          {
            rotation: 0,
            force3D: "auto",
            ease: "none",
            scrollTrigger: {
              trigger: featuresTimingRef.current,
              start: "top bottom",
              end: "top 18%",
              scrub: true,
            },
          }
        );
      }

      // 2. Project Library Sheet: starts tilted +4deg, levels to 0deg
      if (workTimingRef.current && workSheetRef.current) {
        gsap.fromTo(
          workSheetRef.current,
          { rotation: 4, force3D: "auto" },
          {
            rotation: 0,
            force3D: "auto",
            ease: "none",
            scrollTrigger: {
              trigger: workTimingRef.current,
              start: "top bottom",
              end: "top 20%",
              scrub: true,
            },
          }
        );
      }

      // 3. Pricing Sheet: starts tilted -5deg, levels to 0deg
      if (pricingTimingRef.current && pricingSheetRef.current) {
        gsap.fromTo(
          pricingSheetRef.current,
          { rotation: -5, force3D: "auto" },
          {
            rotation: 0,
            force3D: "auto",
            ease: "none",
            scrollTrigger: {
              trigger: pricingTimingRef.current,
              start: "top bottom",
              end: "top 20%",
              scrub: true,
            },
          }
        );
      }

      // 4. FAQs Sheet: starts tilted +4deg, levels to 0deg
      if (faqsTimingRef.current && faqsSheetRef.current) {
        gsap.fromTo(
          faqsSheetRef.current,
          { rotation: 4, force3D: "auto" },
          {
            rotation: 0,
            force3D: "auto",
            ease: "none",
            scrollTrigger: {
              trigger: faqsTimingRef.current,
              start: "top bottom",
              end: "top 20%",
              scrub: true,
            },
          }
        );
      }

      // 5. Join Now (Signup) Sheet: starts tilted +8deg, levels to 0deg while reading, then tilts slightly (+2deg) as bottom lifts over blueprint
      if (signupTimingRef.current && signupSheetRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: signupTimingRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            onEnter: () => {
              coordsContainerRef.current?.classList.add("is-white");
              emailContainerRef.current?.classList.add("is-white");
            },
            onLeaveBack: () => {
              coordsContainerRef.current?.classList.remove("is-white");
              emailContainerRef.current?.classList.remove("is-white");
            },
          },
        });
        tl.fromTo(
          signupSheetRef.current,
          { rotation: 8, force3D: "auto" },
          { rotation: 0, force3D: "auto", ease: "none", duration: 0.36 }
        )
          .to(signupSheetRef.current, {
            rotation: 0,
            force3D: "auto",
            ease: "none",
            duration: 0.36,
          })
          .to(signupSheetRef.current, {
            rotation: 2.2,
            force3D: "auto",
            ease: "none",
            duration: 0.28,
          });
      }

      // 6. Floating 3D blocks subtle parallax in Join Now
      gsap.utils.toArray<HTMLElement>(".floating-logo-block").forEach((block, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.fromTo(
          block,
          { y: 28 * dir, rotation: -6 * dir, force3D: "auto" },
          {
            y: -28 * dir,
            rotation: 6 * dir,
            force3D: "auto",
            ease: "none",
            scrollTrigger: {
              trigger: signupTimingRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      // 7. Footer card reveal + Blueprint isometric wireframe parallax
      if (footerRevealRef.current && footerCardRef.current) {
        gsap.fromTo(
          footerCardRef.current,
          { y: "85%", rotation: -10, force3D: "auto" },
          {
            y: "0%",
            rotation: 0,
            force3D: "auto",
            ease: "none",
            scrollTrigger: {
              trigger: footerRevealRef.current,
              start: "top 80%",
              end: "bottom bottom",
              scrub: true,
            },
          }
        );
      }

      if (footerRevealRef.current && blueprintSvgRef.current) {
        gsap.fromTo(
          blueprintSvgRef.current,
          { y: 60, scale: 0.96, force3D: "auto" },
          {
            y: -40,
            scale: 1.04,
            force3D: "auto",
            ease: "none",
            scrollTrigger: {
              trigger: footerRevealRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);
  return { mobileMenuOpen, setMobileMenuOpen, openFaq, setOpenFaq, cookieDismissed, setCookieDismissed, expandedCard, setExpandedCard, coordXRef, coordYRef, coordsContainerRef, emailContainerRef, navBorderRectRef, heroVideoWrapRef, floatingBlocksContainerRef, blueprintMouseWrapRef, featuresTimingRef, featuresSheetRef, workTimingRef, workSheetRef, pricingTimingRef, pricingSheetRef, faqsTimingRef, faqsSheetRef, signupTimingRef, signupSheetRef, footerRevealRef, footerCardRef, blueprintSvgRef };
}
