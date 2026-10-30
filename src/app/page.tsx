"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const TAB_PATH_STANDARD =
  "M.68,55.09c18,0,33.61-11.42,37.64-27.55h.01C42.39,11.43,58,0,75.98,0h145.6c18,0,33.61,11.42,37.64,27.55,4.05,16.12,19.66,27.55,37.64,27.55L0,55.23";
const TAB_PATH_WIDE =
  "M.68,55.09c18,0,33.61-11.42,37.64-27.55h.01C42.39,11.43,58,0,75.98,0h172.5c18,0,33.61,11.42,37.64,27.55,4.05,16.12,19.66,27.55,37.64,27.55L0,55.23";

interface ProjectItem {
  category: string;
  image: string;
  linework: string;
  renderOnGrid: boolean;
  labelPlacement: "above" | "below";
  labelGap: string;
  labelTilt: string;
  labelX: string;
}

const PROJECT_ITEMS: ProjectItem[] = [
  {
    category: "Workplace",
    image: "/images/plamo/examples/through-lot-office.webp",
    linework: "/images/plamo/examples/through-lot-office-linework.webp",
    renderOnGrid: true,
    labelPlacement: "below",
    labelGap: "24px",
    labelTilt: "-2.2deg",
    labelX: "24%",
  },
  {
    category: "Mid-rise",
    image: "/images/plamo/examples/curved-brick-facade.webp",
    linework: "/images/plamo/examples/curved-brick-facade-linework.webp",
    renderOnGrid: false,
    labelPlacement: "above",
    labelGap: "29px",
    labelTilt: "1.5deg",
    labelX: "70%",
  },
  {
    category: "Cultural",
    image: "/images/plamo/examples/fin-screen-art-museum.webp",
    linework: "/images/plamo/examples/fin-screen-art-museum-linework.webp",
    renderOnGrid: false,
    labelPlacement: "below",
    labelGap: "21px",
    labelTilt: "-1.1deg",
    labelX: "68%",
  },
  {
    category: "Transit",
    image: "/images/plamo/examples/high-speed-rail-station.webp",
    linework: "/images/plamo/examples/high-speed-rail-station-linework.webp",
    renderOnGrid: false,
    labelPlacement: "above",
    labelGap: "26px",
    labelTilt: "2deg",
    labelX: "32%",
  },
  {
    category: "Structure",
    image: "/images/plamo/examples/steel-canopy.webp",
    linework: "/images/plamo/examples/steel-canopy-linework.webp",
    renderOnGrid: false,
    labelPlacement: "above",
    labelGap: "23px",
    labelTilt: "-1.7deg",
    labelX: "76%",
  },
  {
    category: "Data center",
    image: "/images/plamo/examples/data-center.webp",
    linework: "/images/plamo/examples/data-center-linework.webp",
    renderOnGrid: false,
    labelPlacement: "below",
    labelGap: "28px",
    labelTilt: "1.2deg",
    labelX: "26%",
  },
  {
    category: "Pavilion",
    image: "/images/plamo/examples/spine-shelter-pavilion.webp",
    linework: "/images/plamo/examples/spine-shelter-pavilion-linework.webp",
    renderOnGrid: true,
    labelPlacement: "below",
    labelGap: "22px",
    labelTilt: "-2.4deg",
    labelX: "64%",
  },
  {
    category: "Facade",
    image: "/images/plamo/examples/fin-facade-detail.webp",
    linework: "/images/plamo/examples/fin-facade-detail-linework.webp",
    renderOnGrid: true,
    labelPlacement: "above",
    labelGap: "30px",
    labelTilt: "1.6deg",
    labelX: "35%",
  },
  {
    category: "Hospitality",
    image: "/images/plamo/examples/bistro-and-bar.webp",
    linework: "/images/plamo/examples/bistro-and-bar-linework.webp",
    renderOnGrid: false,
    labelPlacement: "below",
    labelGap: "25px",
    labelTilt: "-1.3deg",
    labelX: "72%",
  },
];

const ROADMAP_CHIPS = [
  "Site selection",
  ".3dm import",
  "BIM export (.ifc, .rvt)",
  "BIM template import (.rte)",
  "Custom skills and assets",
  "Direct 3D edit",
  "Mobile support",
  "Collaboration",
  "and many more...",
];

function FolderTab({
  label,
  position,
  wide = false,
  fillColor,
  textColor = "text-black",
}: {
  label: string;
  position: "left" | "right";
  wide?: boolean;
  fillColor: string;
  textColor?: string;
}) {
  const viewBox = wide ? "0 0 323.76 55.23" : "0 0 296.86 55.23";
  const pathD = wide ? TAB_PATH_WIDE : TAB_PATH_STANDARD;
  const tabVars = wide
    ? ({
        "--tab-width": "12.9em",
        "--tab-width-lg": "20.18em",
      } as React.CSSProperties)
    : ({
        "--tab-width": "9.5em",
        "--tab-width-lg": "18.5em",
      } as React.CSSProperties);

  return (
    <h2
      className={`tab-root | absolute top-0 -translate-y-[calc(100%-6px)] flex items-center justify-center tab-root--${position}`}
      style={tabVars}
    >
      <div className="tab absolute size-full inset-0" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={viewBox}
          preserveAspectRatio="none"
          className="size-full block"
        >
          <path d={pathD} fill={fillColor} />
        </svg>
      </div>
      <span
        className={`${textColor} tab-label | relative z-1 font-geist tracking-5 uppercase font-500`}
      >
        {label}
      </span>
    </h2>
  );
}

function PaperActionButton({
  href,
  label,
  accentColor = "#EC633D",
  hoverIconColor,
  widthClass = "w-200",
}: {
  href: string;
  label: string;
  accentColor?: string;
  hoverIconColor?: string;
  widthClass?: string;
}) {
  const secondaryColor =
    hoverIconColor ?? (accentColor === "#3B60C5" ? "#EC633D" : "#3B60C5");
  const coverRef = useRef<HTMLDivElement>(null);
  const bg1Ref = useRef<SVGRectElement>(null);
  const bg2Ref = useRef<SVGRectElement>(null);
  const arrow1Ref = useRef<SVGPathElement>(null);
  const arrow2Ref = useRef<SVGPathElement>(null);
  const dotsRef = useRef<SVGGElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    const dur = 0.2;
    const ease = "expo.out";
    if (coverRef.current) {
      gsap.to(coverRef.current, {
        scaleY: 1,
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
    if (bg1Ref.current && bg2Ref.current) {
      gsap.to(bg1Ref.current, {
        opacity: 0,
        duration: 0.15,
        ease,
        overwrite: true,
      });
      gsap.to(bg2Ref.current, {
        opacity: 1,
        duration: 0.15,
        ease,
        overwrite: true,
      });
    }
    if (arrow1Ref.current && arrow2Ref.current) {
      gsap.to(arrow1Ref.current, {
        x: "300%",
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
      gsap.to(arrow2Ref.current, {
        scale: 1,
        svgOrigin: "19 19",
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
    if (dotsRef.current) {
      const circles = Array.from(dotsRef.current.children);
      gsap.to(circles, {
        x: "25%",
        fillOpacity: (i: number) => [0.2, 0.4, 0.6, 1, 0][i] ?? 0,
        duration: dur,
        ease,
        overwrite: true,
      });
    }
    if (text1Ref.current && text2Ref.current) {
      gsap.to([text1Ref.current, text2Ref.current], {
        yPercent: -100,
        color: "#EADFC9",
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
  };

  const handleLeave = () => {
    const dur = 0.2;
    const ease = "expo.out";
    if (coverRef.current) {
      gsap.to(coverRef.current, {
        scaleY: 0,
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
    if (bg1Ref.current && bg2Ref.current) {
      gsap.to(bg1Ref.current, {
        opacity: 1,
        duration: 0.15,
        ease,
        overwrite: true,
      });
      gsap.to(bg2Ref.current, {
        opacity: 0,
        duration: 0.15,
        ease,
        overwrite: true,
      });
    }
    if (arrow1Ref.current && arrow2Ref.current) {
      gsap.to(arrow1Ref.current, {
        x: "0%",
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
      gsap.to(arrow2Ref.current, {
        scale: 0,
        svgOrigin: "19 19",
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
    if (dotsRef.current) {
      const circles = Array.from(dotsRef.current.children);
      gsap.to(circles, {
        x: "0%",
        fillOpacity: (i: number) => [0, 0.2, 0.4, 0.6, 1][i] ?? 0,
        duration: dur,
        ease,
        overwrite: true,
      });
    }
    if (text1Ref.current && text2Ref.current) {
      gsap.to([text1Ref.current, text2Ref.current], {
        yPercent: 0,
        color: "#212121",
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
  };

  return (
    <a
      href={href}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      className={`js-modal-button | button-paper | h-48 inline-flex overflow-clip cursor-pointer bg-[#FDF8F0] text-[#212121] p-6 rounded-4 relative group ${widthClass}`}
    >
      <div
        ref={coverRef}
        className="js-btn-bg absolute inset-[-1%] size-[102%] z-0 origin-bottom rounded-4"
        style={{ backgroundColor: accentColor, transform: "scaleY(0)" }}
      />
      <div className="h-full w-36 shrink-0 flex items-center justify-center z-1 relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="37"
          viewBox="0 0 37 37"
          fill="none"
          className="size-36"
        >
          <rect
            ref={bg1Ref}
            width="37"
            height="37"
            rx="2"
            fill={accentColor}
          />
          <rect
            ref={bg2Ref}
            width="37"
            height="37"
            rx="2"
            fill={secondaryColor}
            style={{ opacity: 0 }}
          />
          <path
            ref={arrow1Ref}
            d="M21 25L27 19L21 13"
            stroke="#EADFC9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            ref={arrow2Ref}
            d="M15 25L21 19L15 13"
            stroke="#EADFC9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: "scale(0)", transformOrigin: "19px 19px" }}
          />
          <g ref={dotsRef}>
            <circle cx="4" cy="19" r="1" fill="#D9D9D9" fillOpacity="0" />
            <circle cx="8" cy="19" r="1" fill="#D9D9D9" fillOpacity="0.2" />
            <circle cx="12" cy="19" r="1" fill="#D9D9D9" fillOpacity="0.4" />
            <circle cx="16" cy="19" r="1" fill="#D9D9D9" fillOpacity="0.6" />
            <circle cx="20" cy="19" r="1" fill="#D9D9D9" fillOpacity="1" />
          </g>
        </svg>
      </div>
      <div className="font-geist text-[13px] font-500 -tracking-2 leading-1.1 flex w-full items-center justify-center relative z-1 h-full overflow-clip">
        <div className="relative w-full h-full flex items-center justify-center overflow-clip">
          <div
            ref={text1Ref}
            className="w-full h-full flex items-center justify-center text-center"
          >
            {label}
          </div>
          <div
            ref={text2Ref}
            aria-hidden="true"
            className="w-full h-full flex items-center justify-center text-center absolute top-full left-0"
          >
            {label}
          </div>
        </div>
      </div>
    </a>
  );
}

function DrawbridgeButton({
  href,
  label,
  className = "",
  coverColor = "#EC633D",
  squarePrimaryColor = "#EC633D",
  squareHoverColor = "#1d2378",
  textPrimaryColor = "#FFFBF3",
  textHoverColor = "#FFFBF3",
}: {
  href: string;
  label: string;
  className?: string;
  coverColor?: string;
  squarePrimaryColor?: string;
  squareHoverColor?: string;
  textPrimaryColor?: string;
  textHoverColor?: string;
}) {
  const coverRef = useRef<HTMLDivElement>(null);
  const bg1Ref = useRef<SVGRectElement>(null);
  const bg2Ref = useRef<SVGRectElement>(null);
  const barRef = useRef<SVGPathElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    const dur = 0.2;
    const ease = "expo.out";
    if (coverRef.current) {
      gsap.to(coverRef.current, {
        scaleY: 1,
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
    if (bg1Ref.current && bg2Ref.current) {
      gsap.to(bg1Ref.current, {
        opacity: 0,
        duration: 0.15,
        ease,
        overwrite: true,
      });
      gsap.to(bg2Ref.current, {
        opacity: 1,
        duration: 0.15,
        ease,
        overwrite: true,
      });
    }
    if (barRef.current) {
      gsap.to(barRef.current, {
        rotate: -90,
        svgOrigin: "8 28",
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
    if (text1Ref.current && text2Ref.current) {
      gsap.to([text1Ref.current, text2Ref.current], {
        yPercent: -100,
        color: textHoverColor,
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
  };

  const handleLeave = () => {
    const dur = 0.2;
    const ease = "expo.out";
    if (coverRef.current) {
      gsap.to(coverRef.current, {
        scaleY: 0,
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
    if (bg1Ref.current && bg2Ref.current) {
      gsap.to(bg1Ref.current, {
        opacity: 1,
        duration: 0.15,
        ease,
        overwrite: true,
      });
      gsap.to(bg2Ref.current, {
        opacity: 0,
        duration: 0.15,
        ease,
        overwrite: true,
      });
    }
    if (barRef.current) {
      gsap.to(barRef.current, {
        rotate: 0,
        svgOrigin: "8 28",
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
    if (text1Ref.current && text2Ref.current) {
      gsap.to([text1Ref.current, text2Ref.current], {
        yPercent: 0,
        color: textPrimaryColor,
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
  };

  return (
    <a
      href={href}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      className={`js-modal-button | h-48 inline-flex gap-8 overflow-clip cursor-pointer py-6 rounded-4 relative pl-6 pr-16 ${className}`}
    >
      <div
        ref={coverRef}
        className="absolute inset-[-1%] size-[102%] z-0 origin-bottom rounded-4"
        style={{ backgroundColor: coverColor, transform: "scaleY(0)" }}
      />
      <div className="h-full w-36 shrink-0 flex items-center justify-center z-1 relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="37"
          className="size-36"
          viewBox="0 0 37 37"
          fill="none"
        >
          <rect
            ref={bg1Ref}
            width="37"
            height="37"
            rx="2"
            fill={squarePrimaryColor}
          />
          <rect
            ref={bg2Ref}
            width="37"
            height="37"
            rx="2"
            fill={squareHoverColor}
            style={{ opacity: 0 }}
          />
          <rect
            x="9.5"
            y="8"
            width="20"
            height="1"
            rx="0.2"
            transform="rotate(90 9.5 8)"
            fill="white"
            fillOpacity="0.4"
          />
          <path
            d="M28 28C28 18.0589 19.9411 10 10 10"
            stroke="white"
            strokeOpacity="0.4"
            strokeDasharray="1 1"
          />
          <path
            ref={barRef}
            d="M32 28.8C32 28.9105 31.9105 29 31.8 29L9 29L9 27L31.8 27C31.9105 27 32 27.0895 32 27.2L32 28.8Z"
            fill="#F6EDDA"
          />
          <path
            d="M32 28.8C32 28.9105 31.9105 29 31.8 29L27.2 29C27.0895 29 27 28.9105 27 28.8L27 27.2C27 27.0895 27.0895 27 27.2 27L31.8 27C31.9105 27 32 27.0895 32 27.2L32 28.8Z"
            fill="#F6EDDA"
          />
          <path
            d="M9 29L6.2 29C6.08954 29 6 28.9105 6 28.8L6 27.2C6 27.0895 6.08954 27 6.2 27L9 27L9 29Z"
            fill="#F6EDDA"
          />
        </svg>
      </div>
      <div className="button-primary-label font-geist font-500 -tracking-2 leading-1 flex w-full items-center justify-center relative z-1 h-full overflow-clip">
        <div className="relative w-full h-full flex items-center justify-center overflow-clip">
          <div
            ref={text1Ref}
            className="w-full h-full flex items-center justify-center text-center whitespace-nowrap"
          >
            {label}
          </div>
          <div
            ref={text2Ref}
            aria-hidden="true"
            className="w-full h-full flex items-center justify-center text-center whitespace-nowrap absolute top-full left-0"
          >
            {label}
          </div>
        </div>
      </div>
    </a>
  );
}

function NavHoverLink({
  href,
  label,
  className = "",
  underlineVariant = "dark",
  target,
  rel,
}: {
  href: string;
  label: string;
  className?: string;
  underlineVariant?: "dark" | "accent";
  target?: string;
  rel?: string;
}) {
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);
  const clipRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  const handleEnter = () => {
    const dur = 0.2;
    const ease = "expo.out";
    if (text1Ref.current && text2Ref.current) {
      gsap.to([text1Ref.current, text2Ref.current], {
        yPercent: -100,
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
    if (clipRef.current && lineRef.current) {
      gsap.to(clipRef.current, {
        xPercent: 0,
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
      gsap.to(lineRef.current, {
        xPercent: 0,
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
  };

  const handleLeave = () => {
    const dur = 0.2;
    const ease = "expo.out";
    if (text1Ref.current && text2Ref.current) {
      gsap.to([text1Ref.current, text2Ref.current], {
        yPercent: 0,
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
    if (clipRef.current && lineRef.current) {
      gsap.to(clipRef.current, {
        xPercent: -105,
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
      gsap.to(lineRef.current, {
        xPercent: 105,
        duration: dur,
        ease,
        overwrite: true,
        force3D: true,
      });
    }
  };

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      className={`relative inline-block transform-gpu ${className}`}
    >
      <span className="relative inline-block overflow-clip align-bottom pb-[2px]">
        <span ref={text1Ref} className="block">
          {label}
        </span>
        <span
          ref={text2Ref}
          aria-hidden="true"
          className={`block absolute top-full left-0 w-full ${
            underlineVariant === "accent" ? "text-[#C2B192]" : "text-[#3B60C5]"
          }`}
        >
          {label}
        </span>
      </span>
      <span
        ref={clipRef}
        aria-hidden="true"
        className="clip pointer-events-none"
        style={{ transform: "translateX(-105%)" }}
      >
        <span
          ref={lineRef}
          className={`underline ${
            underlineVariant === "accent"
              ? "nav-underline-accent"
              : "nav-underline-dark"
          }`}
          style={{ transform: "translateX(105%)" }}
        />
      </span>
    </a>
  );
}

export default function LandingPage() {
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

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // Interactive 3D magnetic tilt & lift on Feature cards, Pricing cards, and Roadmap chips
  useEffect(() => {
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
          force3D: true,
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
          force3D: true,
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
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.13,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      syncTouch: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // 1. Features Sheet: starts tilted -5deg at bottom, levels to 0deg as header enters reading zone
      if (featuresTimingRef.current && featuresSheetRef.current) {
        gsap.fromTo(
          featuresSheetRef.current,
          { rotation: -5, force3D: true },
          {
            rotation: 0,
            force3D: true,
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
          { rotation: 4, force3D: true },
          {
            rotation: 0,
            force3D: true,
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
          { rotation: -5, force3D: true },
          {
            rotation: 0,
            force3D: true,
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
          { rotation: 4, force3D: true },
          {
            rotation: 0,
            force3D: true,
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
          { rotation: 8, force3D: true },
          { rotation: 0, force3D: true, ease: "none", duration: 0.36 }
        )
          .to(signupSheetRef.current, {
            rotation: 0,
            force3D: true,
            ease: "none",
            duration: 0.36,
          })
          .to(signupSheetRef.current, {
            rotation: 2.2,
            force3D: true,
            ease: "none",
            duration: 0.28,
          });
      }

      // 6. Floating 3D blocks subtle parallax in Join Now
      gsap.utils.toArray<HTMLElement>(".floating-logo-block").forEach((block, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.fromTo(
          block,
          { y: 28 * dir, rotation: -6 * dir, force3D: true },
          {
            y: -28 * dir,
            rotation: 6 * dir,
            force3D: true,
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
          { y: "85%", rotation: -10, force3D: true },
          {
            y: "0%",
            rotation: 0,
            force3D: true,
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
          { y: 60, scale: 0.96, force3D: true },
          {
            y: -40,
            scale: 1.04,
            force3D: true,
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

  return (
    <div id="__nuxt">
      {/* ================= FIXED HEADER / NAVIGATION (1:1 About Page Navbar) ================= */}
      <div className="container fixed top-0 left-0 pt-16 w-full px-16 z-30 lg:hidden sm:px-48">
        <div className="shadow | bg-[#FFFBF3] border border-[#9C9C9C] rounded-2 p-6 pl-8">
          <div className="flex justify-between items-center">
            <a href="/" aria-label="illoca">
              <svg className="h-26 w-62">
                <use href="/_nuxt/spritemap.53a09954.svg#sprite-illoca" />
              </svg>
            </a>
            <a
              href="/studio"
              className="p-12 text-12 sm:text-10 font-400 font-geist bg-primary text-white leading-1 rounded-4"
            >
              Try for free
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex items-center gap-12 relative h-20 cursor-pointer"
            >
              <div className="overflow-hidden pr-8 -mr-8">
                <div className="relative">
                  <div className="font-geist text-12 font-500 leading-1 -tracking-2 text-[#212121]">
                    {mobileMenuOpen ? "Close" : "Menu"}
                  </div>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-20 relative z-2"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M19.375 0C19.7202 0 20 0.279822 20 0.625V19.375C20 19.7202 19.7202 20 19.375 20H0.625C0.279822 20 0 19.7202 0 19.375V0.625C0 0.279822 0.279822 0 0.625 0H19.375ZM1.875 13.75C1.52982 13.75 1.25 14.0298 1.25 14.375V18.125C1.25 18.4702 1.52982 18.75 1.875 18.75H18.125C18.4702 18.75 18.75 18.4702 18.75 18.125V14.375C18.75 14.0298 18.4702 13.75 18.125 13.75H1.875ZM1.875 7.5C1.52982 7.5 1.25 7.77982 1.25 8.125V11.875C1.25 12.2202 1.52982 12.5 1.875 12.5H18.125C18.4702 12.5 18.75 12.2202 18.75 11.875V8.125C18.75 7.77982 18.4702 7.5 18.125 7.5H1.875ZM1.875 1.25C1.52982 1.25 1.25 1.52982 1.25 1.875V5.625C1.25 5.97018 1.52982 6.25 1.875 6.25H18.125C18.4702 6.25 18.75 5.97018 18.75 5.625V1.875C18.75 1.52982 18.4702 1.25 18.125 1.25H1.875Z"
                  fill="#3B60C5"
                />
              </svg>
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="flex flex-col items-center justify-center pt-40 pb-24">
              <ul className="font-graphik text-[#373737] text-28 font-500 leading-1.3 -tracking-2 text-center flex flex-col gap-12">
                <li>
                  <a
                    href="#products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="pointer-events-auto"
                  >
                    Products
                  </a>
                </li>
                <li>
                  <a
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="pointer-events-auto"
                  >
                    Projects
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="pointer-events-auto"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="pointer-events-auto"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="pointer-events-auto"
                  >
                    Sign In
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <nav className="hidden lg:block z-30 top-16 left-1/2 -translate-x-1/2 fixed w-706 h-64 rounded-2">
        <svg
          className="absolute inset-0 z-10 pointer-events-none"
          viewBox="0 0 706 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            ref={navBorderRectRef}
            x="0.5"
            y="0.5"
            width="705"
            height="63"
            rx="2"
            stroke="#9C9C9C"
          />
        </svg>
        <div className="absolute size-full inset-0 bg-white border border-[#9C9C9C] rounded-2 flex items-center justify-between pr-8 pl-12">
          <a href="/" className="flex gap-12 items-center" aria-label="illoca">
            <svg className="size-40">
              <use href="/_nuxt/spritemap.53a09954.svg#sprite-logo" />
            </svg>
            <svg className="h-26 w-62">
              <use href="/_nuxt/spritemap.53a09954.svg#sprite-illoca" />
            </svg>
          </a>

          <ul className="flex gap-16 text-14 font-geist font-500 leading-1 -tracking-2 text-[#414141]">
            <li>
              <NavHoverLink
                href="#products"
                label="Products"
                className="translate-y-2"
                underlineVariant="dark"
              />
            </li>
            <li>
              <NavHoverLink
                href="/dashboard"
                label="Projects"
                className="translate-y-2"
                underlineVariant="dark"
              />
            </li>
            <li>
              <NavHoverLink
                href="/about"
                label="About Us"
                className="translate-y-2"
                underlineVariant="dark"
              />
            </li>
            <li>
              <NavHoverLink
                href="#pricing"
                label="Pricing"
                className="translate-y-2"
                underlineVariant="dark"
              />
            </li>
            <li>
              <NavHoverLink
                href="/sign-in"
                label="Sign In"
                className="translate-y-2"
                underlineVariant="dark"
              />
            </li>
          </ul>

          <DrawbridgeButton
            href="/studio"
            label="Try for free"
            className="bg-primary text-[#FFFBF3] w-184 p-6"
            coverColor="#365abd"
            squarePrimaryColor="#EC633D"
            squareHoverColor="#1d2378"
            textPrimaryColor="#FFFBF3"
            textHoverColor="#FFFBF3"
          />
        </div>
      </nav>

      <div
        ref={coordsContainerRef}
        className="coords | fixed top-37 left-32 z-20 font-architect text-12 leading-1 hidden lg:block tabular-nums transition-colors duration-200"
        aria-hidden="true"
      >
        <div>
          <span>X</span> <span ref={coordXRef}>0.00</span>
        </div>
        <div>
          <span>Y</span> <span ref={coordYRef}>0.00</span>
        </div>
      </div>

      <div
        ref={emailContainerRef}
        className="email | fixed top-42 right-32 z-20 font-architect text-18 leading-1 hidden lg:block transition-colors duration-200"
      >
        <a href="mailto:hello@illoca.com">hello@illoca.com</a>
      </div>

      {/* ================= MAIN SECTIONS ================= */}
      <div>
        <div className="text-black">
          <div className="container">
            <div>
              {/* 1. HERO SECTION */}
              <section className="hero bg-grid -mx-24 lg:-mx-128 relative overflow-hidden">
                <div className="relative z-1 w-screen mx-auto flex flex-col items-center text-center px-24 pt-128 pb-176 lg:pt-176 lg:pb-480 reveal reveal--in">
                  <div className="mb-16 lg:mb-24 -rotate-2">
                    <span className="font-architect-rule text-16 lg:text-24 leading-0.9 text-[#5B5B5B] inline-block relative">
                      <span className="js-eyebrow-text | inline-block">
                        Beta
                      </span>
                    </span>
                  </div>

                  <h1 className="font-f37 text-56 lg:text-102 leading-1 no-kern mb-24 max-w-1200 mx-auto text-balance">
                    Plamo, the New Agentic 3D Workspace
                  </h1>

                  <p className="font-graphik text-18 lg:text-24 leading-1.2 -tracking-2 text-body max-w-[760px] mx-auto text-pretty">
                    Plamo brings agentic AI to 3D design, transforming sketches,
                    images, and prompts into editable, parametric models.
                  </p>

                  <div
                    className="w-full max-w-1200 mx-auto mt-40 lg:mt-56"
                    style={{ perspective: "1200px" }}
                  >
                    <div
                      ref={heroVideoWrapRef}
                      style={{
                        transformStyle: "preserve-3d",
                        willChange: "transform",
                      }}
                    >
                      <video
                        className="block w-full aspect-video rounded-8 border border-[#A7A7A7] object-cover bg-black shadow-[0_18px_40px_rgba(0,0,0,0.16)]"
                        src="https://static.illoca.com/assets/plamo/plamo-trailer.mp4"
                        poster="/images/plamo/plamo-poster.jpg"
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                        preload="metadata"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. FEATURES SECTION */}
              <section id="products" className="features relative">
                <div
                  ref={featuresTimingRef}
                  className="-mx-24 lg:-mx-128 -mt-80 lg:-mt-320 relative z-2"
                >
                  <div
                    ref={featuresSheetRef}
                    className="sheet | origin-top-right -mx-24 lg:-mx-128 relative bg-[#E2D2B3E5]"
                  >
                    <FolderTab
                      label="Features"
                      position="left"
                      fillColor="#E2D2B3E5"
                    />

                    <div className="relative z-1 w-screen mx-auto px-24 pt-72 pb-176 lg:pt-112 lg:pb-480 overflow-hidden">
                      <div className="reveal reveal--in">
                        <h2 className="font-f37 text-56 lg:text-102 leading-0.9 no-kern font-500 text-center mb-24 lg:mb-32 max-w-[900px] mx-auto">
                          Turn imagination into editable 3D
                        </h2>
                        <p className="font-graphik text-18 lg:text-24 leading-1.2 -tracking-2 text-body text-center max-w-[760px] mx-auto text-pretty mb-40 lg:mb-56">
                          Work with AI to build, modify, and coordinate 3D
                          models without starting from scratch each time. No
                          coding or 3D skills required.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-24 lg:gap-32 w-full max-w-1200 mx-auto">
                          <article className="feature-card | flex flex-col p-24 lg:p-32 border border-border/30">
                            <span className="font-architect text-14 lg:text-16 tracking-2 text-[#8A8A8A] block mb-8">
                              {" 01"}
                            </span>
                            <h3 className="font-graphik text-20 lg:text-24 font-500 leading-1.2 -tracking-2 text-[#212121] mb-12">
                              Agentic Planning
                            </h3>
                            <p className="font-graphik text-[17px] leading-[1.55] -tracking-2 text-body">
                              Interprets your intent, plans the approach, and
                              builds from text, images, drawings, or plans.
                            </p>
                          </article>

                          <article className="feature-card | flex flex-col p-24 lg:p-32 border border-border/30">
                            <span className="font-architect text-14 lg:text-16 tracking-2 text-[#8A8A8A] block mb-8">
                              {" 02"}
                            </span>
                            <h3 className="font-graphik text-20 lg:text-24 font-500 leading-1.2 -tracking-2 text-[#212121] mb-12">
                              Parametric Geometry
                            </h3>
                            <p className="font-graphik text-[17px] leading-[1.55] -tracking-2 text-body">
                              Creates editable BREP geometry with parametric
                              logic, so key dimensions and systems stay
                              adjustable.
                            </p>
                          </article>

                          <article className="feature-card | flex flex-col p-24 lg:p-32 border border-border/30">
                            <span className="font-architect text-14 lg:text-16 tracking-2 text-[#8A8A8A] block mb-8">
                              {" 03"}
                            </span>
                            <h3 className="font-graphik text-20 lg:text-24 font-500 leading-1.2 -tracking-2 text-[#212121] mb-12">
                              Browser Native
                            </h3>
                            <p className="font-graphik text-[17px] leading-[1.55] -tracking-2 text-body">
                              Model directly in the browser with layers, section
                              cuts, orthographic views, and no plugin chain.
                            </p>
                          </article>

                          <article className="feature-card | flex flex-col p-24 lg:p-32 border border-border/30">
                            <span className="font-architect text-14 lg:text-16 tracking-2 text-[#8A8A8A] block mb-8">
                              {" 04"}
                            </span>
                            <h3 className="font-graphik text-20 lg:text-24 font-500 leading-1.2 -tracking-2 text-[#212121] mb-12">
                              Seamless Workflow
                            </h3>
                            <p className="font-graphik text-[17px] leading-[1.55] -tracking-2 text-body">
                              Export to Rhino, Grasshopper, SketchUp, GLB, STEP,
                              STL, DXF, or DWG; render, present, and share live
                              projects directly from Plamo.
                            </p>
                          </article>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. PROJECT LIBRARY SECTION */}
              <section className="featured relative">
                <div
                  ref={workTimingRef}
                  className="-mx-24 lg:-mx-128 -mt-80 lg:-mt-320 relative z-2"
                >
                  <div
                    ref={workSheetRef}
                    className="sheet | origin-top-left -mx-24 lg:-mx-128 relative bg-[#D5C097]"
                  >
                    <FolderTab
                      label="Project Library"
                      position="right"
                      wide
                      fillColor="#D5C097"
                    />

                    <div className="relative z-1 w-screen mx-auto px-24 pt-72 pb-176 lg:pt-112 lg:pb-320 overflow-hidden">
                      <div className="text-center mb-32 lg:mb-40 reveal reveal--in">
                        <div className="block text-16 lg:text-24 font-architect-rule text-[#5B5B5B] leading-0.9 font-400 mb-12 -rotate-2">
                          Modeled in Plamo
                        </div>
                        <h2 className="font-f37 text-40 lg:text-72 leading-1 no-kern font-500 mx-auto whitespace-normal lg:whitespace-nowrap">
                          Built for every discipline
                        </h2>
                      </div>

                      <div
                        className={`-mx-24 w-screen magnetic-carousel-host reveal reveal--in ${
                          expandedCard ? "is-carousel-paused" : ""
                        }`}
                        role="region"
                        aria-label="Featured Plamo projects"
                        style={
                          {
                            "--carousel-row-height": "512.867px",
                            "--carousel-open-size": "960px",
                            "--carousel-row-offset": "53.5665px",
                            "--carousel-row-center": "310px",
                          } as React.CSSProperties
                        }
                      >
                        <div
                          className="magnetic-carousel-track"
                          style={
                            {
                              "--carousel-loop-duration": "58.242s",
                              "--carousel-loop-distance": "4368.15px",
                            } as React.CSSProperties
                          }
                        >
                          <div
                            className="magnetic-carousel-set"
                            style={{ width: "8720.3px" }}
                          >
                            <div className="magnetic-carousel-react-host">
                              <div
                                className="magnetic-carousel-row"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "16px",
                                  position: "relative",
                                  overflow: "visible",
                                }}
                              >
                                {[...PROJECT_ITEMS, ...PROJECT_ITEMS].map(
                                  (item, idx) => {
                                    const cardKey = `${idx}-${item.category}`;
                                    const isExpanded = expandedCard === cardKey;
                                    return (
                                      <div
                                        key={cardKey}
                                        className="originkit-magnetic-item"
                                        data-category={item.category}
                                        data-originkit-item={idx % 9}
                                        data-carousel-item-index={idx}
                                        data-carousel-expanded={
                                          isExpanded ? "true" : "false"
                                        }
                                        data-render-on-grid={
                                          item.renderOnGrid ? "true" : "false"
                                        }
                                        data-label-placement={
                                          item.labelPlacement
                                        }
                                        role="button"
                                        tabIndex={idx < 9 ? 0 : -1}
                                        aria-expanded={isExpanded}
                                        aria-label={`Expand ${item.category} project`}
                                        onPointerEnter={(e) => {
                                          e.currentTarget.classList.add(
                                            "is-hovered"
                                          );
                                        }}
                                        onPointerLeave={(e) => {
                                          e.currentTarget.classList.remove(
                                            "is-hovered"
                                          );
                                        }}
                                        onClick={(e) => {
                                          const surface =
                                            e.currentTarget.querySelector<HTMLElement>(
                                              ".project-card-surface"
                                            );
                                          if (isExpanded) {
                                            setExpandedCard(null);
                                            if (surface) {
                                              surface.style.setProperty(
                                                "--compare-position",
                                                "100%"
                                              );
                                            }
                                          } else {
                                            setExpandedCard(cardKey);
                                            if (surface) {
                                              surface.style.setProperty(
                                                "--compare-position",
                                                "38%"
                                              );
                                            }
                                          }
                                        }}
                                        onPointerMove={(e) => {
                                          if (!isExpanded) return;
                                          const rect =
                                            e.currentTarget.getBoundingClientRect();
                                          const pct = Math.max(
                                            5,
                                            Math.min(
                                              95,
                                              ((e.clientX - rect.left) /
                                                rect.width) *
                                                100
                                            )
                                          );
                                          const surface =
                                            e.currentTarget.querySelector<HTMLElement>(
                                              ".project-card-surface"
                                            );
                                          if (surface) {
                                            surface.classList.add(
                                              "is-comparing"
                                            );
                                            surface.style.setProperty(
                                              "--compare-position",
                                              `${pct}%`
                                            );
                                          }
                                        }}
                                        style={
                                          {
                                            flex: "0 0 auto",
                                            width: isExpanded
                                              ? "780px"
                                              : "469.35px",
                                            height: isExpanded
                                              ? "460px"
                                              : "384.867px",
                                            overflow: "hidden",
                                            cursor: "pointer",
                                            transition:
                                              "width 220ms cubic-bezier(0.23, 1, 0.32, 1), height 220ms cubic-bezier(0.23, 1, 0.32, 1)",
                                            willChange: "width, height",
                                            position: "relative",
                                            zIndex: 2,
                                            backgroundColor: "transparent",
                                            backgroundImage: `url("${item.image}")`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center center",
                                            backgroundRepeat: "no-repeat",
                                            "--project-image": `url("${item.image}")`,
                                            "--project-linework": `url("${item.linework}")`,
                                            "--project-image-scale": "1",
                                            "--project-image-hover-scale":
                                              "1.12",
                                            "--project-label-gap":
                                              item.labelGap,
                                            "--project-label-tilt":
                                              item.labelTilt,
                                            "--project-label-x": item.labelX,
                                          } as React.CSSProperties
                                        }
                                      >
                                        <span
                                          className="project-card-surface"
                                          aria-hidden="true"
                                          style={
                                            {
                                              "--compare-position": isExpanded
                                                ? "38%"
                                                : "100%",
                                            } as React.CSSProperties
                                          }
                                        >
                                          <span
                                            className="project-card-grid"
                                            aria-hidden="true"
                                          />
                                          <span
                                            className="project-card-image"
                                            aria-hidden="true"
                                          />
                                          <span
                                            className="project-card-linework"
                                            aria-hidden="true"
                                          />
                                          <span
                                            className="project-card-divider"
                                            aria-hidden="true"
                                          />
                                        </span>
                                        <span
                                          className="project-card-label"
                                          aria-hidden="true"
                                        >
                                          {item.category}
                                        </span>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. PRICING SECTION */}
              <section className="pricing relative">
                <div
                  id="pricing"
                  ref={pricingTimingRef}
                  className="section-anchor | -mx-24 lg:-mx-128 -mt-80 lg:-mt-320 relative z-2"
                >
                  <div
                    ref={pricingSheetRef}
                    className="sheet pricing-sheet | origin-top-right -mx-24 lg:-mx-128 relative"
                  >
                    <FolderTab
                      label="Pricing"
                      position="left"
                      fillColor="#DECFB5"
                    />

                    <div className="relative z-1 w-screen mx-auto px-24 pt-72 pb-176 lg:pt-112 lg:pb-480 overflow-hidden">
                      <h2 className="text-24 lg:text-32 text-center font-500 font-graphik leading-1 -tracking-2 mb-48 lg:mb-88 mx-auto w-300 lg:w-auto reveal reveal--in">
                        Get{" "}
                        <span className="emph">1,000 starter credits</span>{" "}
                        when you sign up today.
                      </h2>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 lg:gap-0 w-full max-w-[1200px] mx-auto reveal reveal--in">
                        {/* Explore Card */}
                        <article className="paper-card--white text-black lg:-mr-10 paper-card | flex flex-col text-center border border-border/30 w-full max-w-[640px] mx-auto lg:max-w-none lg:mx-0">
                          <h3 className="font-graphik text-32 font-500 leading-1 -tracking-2 mb-12">
                            Explore
                          </h3>
                          <p className="text-[#9A9393] font-graphik font-500 leading-1.1 -tracking-2 mb-32">
                            $29.99 / person / month
                          </p>
                          <ul className="tick-list | text-left font-graphik font-500 leading-1.1 -tracking-2 mb-50 text-14 lg:text-16">
                            <li>Everything in Free</li>
                            <li>3,000 credits per month</li>
                            <li>More messages</li>
                            <li>More generation and edits</li>
                            <li>More export quotas</li>
                            <li>Early access to new features</li>
                          </ul>
                          <div className="flex justify-center mt-auto">
                            <PaperActionButton
                              href="/cad"
                              label="Sign up"
                              accentColor="#EC633D"
                              widthClass="w-200"
                            />
                          </div>
                        </article>

                        {/* Team Card (Raised) */}
                        <article className="paper-card--red text-[#FEF9F1] paper-card--raised lg:-my-48 relative z-2 paper-card | flex flex-col text-center border border-border/30 w-full max-w-[640px] mx-auto lg:max-w-none lg:mx-0">
                          <h3 className="font-graphik text-32 font-500 leading-1 -tracking-2 mb-12">
                            Team
                          </h3>
                          <p className="text-[#DECFB2] font-graphik font-500 leading-1.1 -tracking-2 mb-32">
                            $59.99+ / team / month
                          </p>
                          <ul className="tick-list--light tick-list | text-left font-graphik font-500 leading-1.1 -tracking-2 mb-50 text-14 lg:text-16">
                            <li>Everything in Explore</li>
                            <li>Pooled team credits</li>
                            <li>
                              Member, permissions and billing management
                            </li>
                            <li>
                              Enhanced support, SSO and license management
                            </li>
                          </ul>
                          <div className="flex justify-center mt-auto">
                            <PaperActionButton
                              href="/cad"
                              label="Join waitlist"
                              accentColor="#3B60C5"
                              widthClass="w-200"
                            />
                          </div>
                        </article>

                        {/* Enterprise Card */}
                        <article className="paper-card--blue text-[#FEF9F1] lg:-ml-10 paper-card | flex flex-col text-center border border-border/30 w-full max-w-[640px] mx-auto lg:max-w-none lg:mx-0">
                          <h3 className="font-graphik text-32 font-500 leading-1 -tracking-2 mb-12">
                            Enterprise
                          </h3>
                          <p className="text-[#DECFB2] font-graphik font-500 leading-1.1 -tracking-2 mb-32">
                            Custom pricing
                          </p>
                          <ul className="tick-list--light tick-list | text-left font-graphik font-500 leading-1.1 -tracking-2 mb-50 text-14 lg:text-16">
                            <li>Everything in Team</li>
                            <li>Custom agents and enterprise features</li>
                            <li>Enterprise-level security and controls</li>
                            <li>
                              Expanded usage based on different use cases
                            </li>
                            <li>
                              24/7 Priority Support, SLAs and custom legal terms
                            </li>
                          </ul>
                          <div className="flex justify-center mt-auto">
                            <PaperActionButton
                              href="mailto:hello@illoca.com"
                              label="Contact us"
                              accentColor="#EC633D"
                              widthClass="w-200"
                            />
                          </div>
                        </article>
                      </div>

                      <p className="text-center text-12 lg:text-14 font-geist font-500 -tracking-2 text-[#9A9393] mt-48 lg:mt-64">
                        Free plan includes 100 credits that refresh every month.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. FAQS SECTION */}
              <section className="faqs relative">
                <div
                  id="faqs"
                  ref={faqsTimingRef}
                  className="section-anchor | -mx-24 lg:-mx-128 -mt-80 lg:-mt-320 relative z-2"
                >
                  <div
                    ref={faqsSheetRef}
                    className="sheet faqs-sheet | origin-top-left -mx-24 lg:-mx-128 relative"
                  >
                    <FolderTab
                      label="FAQs"
                      position="right"
                      fillColor="#D4BF9C"
                    />

                    <div className="relative z-1 w-screen mx-auto px-24 pt-72 pb-176 lg:pt-112 lg:pb-480 overflow-hidden">
                      <div className="w-full max-w-1200 mx-auto lg:grid lg:grid-cols-[4fr_5fr] lg:gap-64 xl:gap-96 reveal reveal--in">
                        <div className="mb-48 lg:mb-0">
                          <div className="mb-16 -rotate-2">
                            <span className="font-architect text-24 leading-0.9 tracking-2 inline-block">
                              <div className="origin-center transform-gpu w-full h-px bg-[#5b5b5b]" />
                              {" need help? "}
                              <div className="origin-center transform-gpu w-full h-px bg-[#5b5b5b]" />
                            </span>
                          </div>

                          <h2 className="font-f37 text-56 lg:text-102 leading-0.9 no-kern mb-36">
                            {" Frequently Asked Questions "}
                          </h2>

                          <PaperActionButton
                            href="mailto:hello@illoca.com"
                            label="hello@illoca.com"
                            accentColor="#EC633D"
                            widthClass="w-244"
                          />
                        </div>

                        <div className="lg:mt-64">
                          {/* FAQ 0 */}
                          <button
                            type="button"
                            onClick={() =>
                              setOpenFaq(openFaq === 0 ? null : 0)
                            }
                            aria-expanded={openFaq === 0}
                            className="border-b border-dashed border-[#313131] py-10 lg:py-22 w-full font-graphik text-12 lg:text-24 -tracking-2 leading-1.2 font-500 flex justify-between gap-16 items-center text-left cursor-pointer"
                          >
                            <span>
                              How do Tracing Paper and Plamo differ from generic
                              AI or conventional design tools?
                            </span>
                            <span className="accordion-button rounded-2">
                              <svg className="w-12 h-10 transition-transform duration-500">
                                <use href="/_nuxt/spritemap.b8e7abff.svg#sprite-chevron" />
                              </svg>
                            </span>
                          </button>
                          {openFaq === 0 && (
                            <div className="text-16 font-graphik leading-1.4 -tracking-2 pb-16">
                              <p className="pt-16 lg:pt-22 font-graphik leading-1.4 -tracking-2">
                                Tracing Paper and Plamo are AI-native design
                                tools built for the controllability required by
                                professional practice. Together they bridge the
                                gap between creative exploration and technical
                                production:
                              </p>
                              <ul className="list-disc list-outside pt-16 ml-24">
                                <li className="mb-8">
                                  <strong className="font-500">
                                    Beyond Image-Based AI
                                  </strong>
                                  : Unlike generic tools that produce static
                                  pixels, our tools understand architectural
                                  intent and generate structured, parametric 2D
                                  and 3D schematics that are design-ready.
                                </li>
                                <li>
                                  <strong className="font-500">
                                    Enhancing Conventional Workflows
                                  </strong>
                                  : While conventional CAD and BIM software
                                  often require manual, high-effort translation
                                  of ideas, our tools accept natural
                                  inputs—sketches, photos, and texts—to generate
                                  design-ready results directly, so your effort
                                  goes into judgment rather than execution.
                                </li>
                              </ul>
                            </div>
                          )}

                          {/* FAQ 1 */}
                          <button
                            type="button"
                            onClick={() =>
                              setOpenFaq(openFaq === 1 ? null : 1)
                            }
                            aria-expanded={openFaq === 1}
                            className="border-b border-dashed border-[#313131] py-10 lg:py-22 w-full font-graphik text-12 lg:text-24 -tracking-2 leading-1.2 font-500 flex justify-between gap-16 items-center text-left cursor-pointer"
                          >
                            <span>
                              How does Plamo work with my BIM/CAD workflow?
                            </span>
                            <span className="accordion-button rounded-2">
                              <svg className="w-12 h-10 transition-transform duration-500">
                                <use href="/_nuxt/spritemap.b8e7abff.svg#sprite-chevron" />
                              </svg>
                            </span>
                          </button>
                          {openFaq === 1 && (
                            <div className="text-16 font-graphik leading-1.4 -tracking-2 pb-16">
                              <p className="pt-16 lg:pt-22 font-graphik leading-1.4 -tracking-2">
                                <strong className="font-500">Plamo</strong> is a
                                cross-disciplinary modeling tool that turns
                                text, photos, or plans into fully editable,
                                parametric 3D models in any browser. You can
                                easily iterate and experiment with concepts and
                                ideas, then download them as Rhino, Grasshopper,
                                SketchUp, GLB, STEP, STL, DXF, or DWG files in
                                organized layers that you can keep editing in
                                other professional software.
                              </p>
                            </div>
                          )}

                          {/* FAQ 2 */}
                          <button
                            type="button"
                            onClick={() =>
                              setOpenFaq(openFaq === 2 ? null : 2)
                            }
                            aria-expanded={openFaq === 2}
                            className="border-b border-dashed border-[#313131] py-10 lg:py-22 w-full font-graphik text-12 lg:text-24 -tracking-2 leading-1.2 font-500 flex justify-between gap-16 items-center text-left cursor-pointer"
                          >
                            <span>
                              How accurate are the Agent&apos;s outputs, and do
                              I need to learn complex AI prompting?
                            </span>
                            <span className="accordion-button rounded-2">
                              <svg className="w-12 h-10 transition-transform duration-500">
                                <use href="/_nuxt/spritemap.b8e7abff.svg#sprite-chevron" />
                              </svg>
                            </span>
                          </button>
                          {openFaq === 2 && (
                            <div className="text-16 font-graphik leading-1.4 -tracking-2 pb-16">
                              <p className="pt-16 lg:pt-22 font-graphik leading-1.4 -tracking-2">
                                Our tools are built on a
                                &ldquo;Human-in-the-Loop&rdquo; philosophy. You
                                don’t need to be a &ldquo;prompt
                                engineer&rdquo;—if you know how to redline a
                                drawing or describe a change to a colleague, you
                                know how to use Tracing Paper and Plamo. While
                                the Agent provides high-fidelity starting points
                                for 3D generations, massing and floor plans,
                                your professional judgment remains unmediated.
                                You have full control to navigate tradeoffs
                                between aesthetics, function, and client needs,
                                ensuring the output is always a precision
                                reflection of your intent.
                              </p>
                            </div>
                          )}

                          {/* FAQ 3 */}
                          <button
                            type="button"
                            onClick={() =>
                              setOpenFaq(openFaq === 3 ? null : 3)
                            }
                            aria-expanded={openFaq === 3}
                            className="border-b border-dashed border-[#313131] py-10 lg:py-22 w-full font-graphik text-12 lg:text-24 -tracking-2 leading-1.2 font-500 flex justify-between gap-16 items-center text-left cursor-pointer"
                          >
                            <span>
                              Who owns my design IP, and is my data used to
                              train your models?
                            </span>
                            <span className="accordion-button rounded-2">
                              <svg className="w-12 h-10 transition-transform duration-500">
                                <use href="/_nuxt/spritemap.b8e7abff.svg#sprite-chevron" />
                              </svg>
                            </span>
                          </button>
                          {openFaq === 3 && (
                            <div className="text-16 font-graphik leading-1.4 -tracking-2 pb-16">
                              <p className="pt-16 lg:pt-22 font-graphik leading-1.4 -tracking-2">
                                You own your designs 100%. All outputs generated
                                or refined within Tracing Paper or Plamo are
                                your intellectual property. We do not use your
                                proprietary sketches, prompts, project models,
                                or 3D geometry to train our models. For our
                                Enterprise partners, we offer additional
                                security protocols, custom-trained models, and
                                zero-data retention to ensure your firm’s
                                proprietary design logic and &ldquo;secret
                                sauce&rdquo; remain strictly confidential.
                              </p>
                            </div>
                          )}

                          {/* FAQ 4 */}
                          <button
                            type="button"
                            onClick={() =>
                              setOpenFaq(openFaq === 4 ? null : 4)
                            }
                            aria-expanded={openFaq === 4}
                            className="border-b border-dashed border-[#313131] py-10 lg:py-22 w-full font-graphik text-12 lg:text-24 -tracking-2 leading-1.2 font-500 flex justify-between gap-16 items-center text-left cursor-pointer"
                          >
                            <span>
                              How do credits work? Am I charged for every click?
                            </span>
                            <span className="accordion-button rounded-2">
                              <svg className="w-12 h-10 transition-transform duration-500">
                                <use href="/_nuxt/spritemap.b8e7abff.svg#sprite-chevron" />
                              </svg>
                            </span>
                          </button>
                          {openFaq === 4 && (
                            <div className="text-16 font-graphik leading-1.4 -tracking-2 pb-16">
                              <p className="pt-16 lg:pt-22 font-graphik leading-1.4 -tracking-2">
                                We believe in charging for professional output,
                                not curiosity. Credits are one shared balance
                                across Tracing Paper and Plamo, and you’re never
                                charged for navigation, sketching, or using the
                                interface. Credits are consumed only when the
                                Agent performs high-value tasks.
                              </p>
                              <ul className="list-disc list-outside my-16 ml-24">
                                <li>
                                  Credits are charged{" "}
                                  <strong className="font-500">
                                    per round
                                  </strong>
                                </li>
                                <li>
                                  Most generations / edits cost{" "}
                                  <strong className="font-500">
                                    100–150 credits
                                  </strong>
                                </li>
                                <li>
                                  As your project accumulates complexity and
                                  detail, agents will have more to work with —
                                  later rounds{" "}
                                  <strong className="font-500">
                                    might cost more
                                  </strong>{" "}
                                  depending on model complexity
                                </li>
                                <li>
                                  As Plamo evolves, we may introduce dedicated
                                  pricing for specialized workflows, each with
                                  mechanisms tailored to their use
                                </li>
                              </ul>
                              <p className="pt-8 font-graphik leading-1.4 -tracking-2">
                                To get started, every new user receives{" "}
                                <strong>1,000 free starter credits</strong> to
                                experience the power of Tracing Paper and Plamo
                                firsthand.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 6. JOIN NOW / SIGNUP SECTION */}
              <section id="signup" className="signup relative">
                <div
                  ref={signupTimingRef}
                  className="-mx-24 lg:-mx-128 -mt-80 lg:-mt-320 relative z-2"
                >
                  <div
                    ref={signupSheetRef}
                    className="sheet signup-sheet | origin-top-left -mx-24 lg:-mx-128 relative bg-primary"
                  >
                    <FolderTab
                      label="Join now"
                      position="left"
                      fillColor="#1F396C"
                      textColor="text-[#EADFC9]"
                    />

                    {/* 4 Floating 3D Architectural Logo Blocks (Matching video_frames/frame_045.png & frame_055.png) */}
                    <div
                      ref={floatingBlocksContainerRef}
                      className="pointer-events-none absolute inset-0 overflow-hidden hidden lg:block"
                      aria-hidden="true"
                      style={{
                        zIndex: 1,
                        perspective: "1000px",
                        transformStyle: "preserve-3d",
                        willChange: "transform",
                      }}
                    >
                      {/* Top-Left Block: Circle / O */}
                      <div
                        className="floating-logo-block"
                        style={{
                          position: "absolute",
                          left: "11%",
                          top: "14%",
                          width: "148px",
                          height: "148px",
                        }}
                      >
                        <svg
                          viewBox="0 0 180 180"
                          style={{
                            width: "100%",
                            height: "100%",
                            filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.38))",
                          }}
                        >
                          <polygon
                            points="18,24 148,18 156,30 162,158 26,162 18,148"
                            fill="#1255C8"
                            stroke="#1B2848"
                            strokeWidth="2.5"
                          />
                          <rect
                            x="22"
                            y="22"
                            width="132"
                            height="132"
                            rx="6"
                            transform="rotate(-2 88 88)"
                            fill="#DBD6CC"
                            stroke="#1E2430"
                            strokeWidth="2.5"
                          />
                          <circle
                            cx="88"
                            cy="88"
                            r="48"
                            fill="#1255C8"
                            stroke="#1E2430"
                            strokeWidth="2.2"
                          />
                          <ellipse
                            cx="94"
                            cy="84"
                            rx="36"
                            ry="28"
                            transform="rotate(28 94 84)"
                            fill="#DBD6CC"
                            stroke="#1E2430"
                            strokeWidth="2"
                          />
                          <circle
                            cx="88"
                            cy="88"
                            r="19"
                            fill="#B9B3A8"
                            stroke="#1E2430"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>

                      {/* Bottom-Left Block: Chevron / Roof */}
                      <div
                        className="floating-logo-block"
                        style={{
                          position: "absolute",
                          left: "9%",
                          bottom: "15%",
                          width: "160px",
                          height: "160px",
                        }}
                      >
                        <svg
                          viewBox="0 0 190 190"
                          style={{
                            width: "100%",
                            height: "100%",
                            filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.38))",
                          }}
                        >
                          <g transform="rotate(-22 95 95)">
                            <polygon
                              points="18,38 34,24 34,154 18,168"
                              fill="#1255C8"
                              stroke="#1E2430"
                              strokeWidth="2.5"
                            />
                            <polygon
                              points="18,38 148,38 164,24 34,24"
                              fill="#C7C1B6"
                              stroke="#1E2430"
                              strokeWidth="2.5"
                            />
                            <rect
                              x="34"
                              y="38"
                              width="130"
                              height="130"
                              rx="6"
                              fill="#DBD6CC"
                              stroke="#1E2430"
                              strokeWidth="2.5"
                            />
                            <polygon
                              points="52,148 99,64 146,148 122,148 99,106 76,148"
                              fill="#CFC9BE"
                              stroke="#1E2430"
                              strokeWidth="2.2"
                            />
                            <polygon
                              points="52,148 60,154 99,82 99,64"
                              fill="#1255C8"
                            />
                          </g>
                        </svg>
                      </div>

                      {/* Top-Right Block: Quarter-Arc Sector */}
                      <div
                        className="floating-logo-block"
                        style={{
                          position: "absolute",
                          right: "11%",
                          top: "12%",
                          width: "156px",
                          height: "156px",
                        }}
                      >
                        <svg
                          viewBox="0 0 190 190"
                          style={{
                            width: "100%",
                            height: "100%",
                            filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.38))",
                          }}
                        >
                          <g transform="rotate(-10 95 95)">
                            <polygon
                              points="26,150 156,150 166,172 36,172"
                              fill="#1255C8"
                              stroke="#1E2430"
                              strokeWidth="2.5"
                            />
                            <polygon
                              points="156,22 166,44 166,172 156,150"
                              fill="#C7C1B6"
                              stroke="#1E2430"
                              strokeWidth="2.5"
                            />
                            <rect
                              x="26"
                              y="22"
                              width="130"
                              height="128"
                              rx="6"
                              fill="#DBD6CC"
                              stroke="#1E2430"
                              strokeWidth="2.5"
                            />
                            <path
                              d="M42,38 L140,38 A98,98 0 0,1 42,136 Z"
                              fill="#1255C8"
                              stroke="#1E2430"
                              strokeWidth="2.2"
                            />
                            <path
                              d="M42,56 L118,56 A62,62 0 0,1 42,120 Z"
                              fill="#DBD6CC"
                              stroke="#1E2430"
                              strokeWidth="2"
                            />
                          </g>
                        </svg>
                      </div>

                      {/* Bottom-Right Block: Three Horizontal Floor Slabs */}
                      <div
                        className="floating-logo-block"
                        style={{
                          position: "absolute",
                          right: "10%",
                          bottom: "15%",
                          width: "160px",
                          height: "160px",
                        }}
                      >
                        <svg
                          viewBox="0 0 190 190"
                          style={{
                            width: "100%",
                            height: "100%",
                            filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.38))",
                          }}
                        >
                          <g transform="rotate(9 95 95)">
                            <polygon
                              points="26,28 40,16 168,16 156,28"
                              fill="#C7C1B6"
                              stroke="#1E2430"
                              strokeWidth="2.5"
                            />
                            <rect
                              x="26"
                              y="28"
                              width="132"
                              height="132"
                              rx="6"
                              fill="#DBD6CC"
                              stroke="#1E2430"
                              strokeWidth="2.5"
                            />
                            {[42, 80, 118].map((yPos, idx) => (
                              <g key={idx}>
                                <rect
                                  x="40"
                                  y={yPos}
                                  width="104"
                                  height="24"
                                  rx="2"
                                  fill="#C5BFB4"
                                  stroke="#1E2430"
                                  strokeWidth="2"
                                />
                                <polygon
                                  points={`40,${yPos} 118,${yPos} 106,${
                                    yPos + 24
                                  } 40,${yPos + 24}`}
                                  fill="#1255C8"
                                />
                              </g>
                            ))}
                          </g>
                        </svg>
                      </div>
                    </div>

                    <div className="relative z-1 w-screen mx-auto px-24 pt-72 pb-96 lg:pt-112 lg:pb-160 overflow-hidden">
                      <div className="flex flex-col items-center text-center reveal reveal--in">
                        <h2 className="font-f37 text-40 lg:text-72 leading-1 no-kern font-500 text-[#EADFC9] max-w-[800px] mx-auto mb-24 lg:mb-32 whitespace-pre-line">
                          {"You design.\nPlamo models."}
                        </h2>

                        <p className="font-graphik text-18 lg:text-24 leading-1.2 -tracking-2 text-[#D2CBC0] max-w-[640px] mx-auto text-pretty mb-24">
                          For creatives who think in 3D. Start designing for
                          free, with 1,000 credits included. More features
                          coming soon:
                        </p>

                        <ul className="roadmap | flex flex-wrap items-center justify-center gap-12 lg:gap-16 max-w-[720px] mx-auto mb-40 lg:mb-56">
                          {ROADMAP_CHIPS.map((chip) => (
                            <li
                              key={chip}
                              className="roadmap-chip | font-geist font-500 text-[11px] leading-[16px] lg:text-[13px] lg:leading-[20px] tracking-0 text-[#CBC7BE] rounded-2 px-12 py-8"
                            >
                              {chip}
                            </li>
                          ))}
                        </ul>

                        <DrawbridgeButton
                          href="/cad"
                          label="Try for free"
                          className="bg-[#EADFC9] text-[#283F7D] signup-cta"
                          coverColor="#EC633D"
                          squarePrimaryColor="#EC633D"
                          squareHoverColor="#283F7D"
                          textPrimaryColor="#283F7D"
                          textHoverColor="#EADFC9"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* ================= BLUEPRINT FOOTER REVEAL & DARK NAVY FOOTER CARD ================= */}
        <div className="print:hidden">
          <div
            ref={footerRevealRef}
            className="footer-reveal-blueprint footer-blueprint-surface relative overflow-hidden"
          >
            {/* Isometric 3D Blueprint Architectural Wireframe (Matching video_frames/frame_062.png - frame_078.png) */}
            <div
              className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden"
              aria-hidden="true"
              style={{ perspective: "1200px" }}
            >
              <div
                ref={blueprintMouseWrapRef}
                className="w-full flex items-start justify-center"
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
              >
                <svg
                  ref={blueprintSvgRef}
                  viewBox="0 0 1400 920"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[1280px] max-w-[94vw] h-auto mt-[20px] opacity-95"
                >
                <g stroke="rgba(255,255,255,0.12)" strokeWidth="1">
                  <line x1="700" y1="20" x2="160" y2="332" />
                  <line x1="700" y1="20" x2="1240" y2="332" />
                  <line x1="160" y1="332" x2="700" y2="644" />
                  <line x1="1240" y1="332" x2="700" y2="644" />
                  <line x1="430" y1="176" x2="970" y2="488" />
                  <line x1="970" y1="176" x2="430" y2="488" />
                </g>

                <g
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                >
                  <polygon
                    points="700,60 1160,326 700,592 240,326"
                    fill="rgba(0, 70, 180, 0.25)"
                  />
                  <polyline points="240,326 240,486 700,752 1160,486 1160,326" />
                  <line x1="700" y1="592" x2="700" y2="752" />

                  <polygon
                    points="700,78 912,200 700,322 488,200"
                    fill="rgba(0, 58, 155, 0.45)"
                  />
                  <path d="M510,200 Q700,108 890,200" />
                  <path d="M535,214 Q700,130 865,214" />
                  <line x1="700" y1="78" x2="700" y2="148" />
                  <path
                    d="M620,276 Q700,245 780,276"
                    stroke="rgba(255,255,255,0.5)"
                  />

                  <polygon
                    points="470,210 682,332 470,454 258,332"
                    fill="rgba(0, 58, 155, 0.45)"
                  />
                  <ellipse cx="470" cy="332" rx="142" ry="82" />
                  <ellipse cx="470" cy="340" rx="134" ry="77" />
                  <ellipse
                    cx="470"
                    cy="332"
                    rx="70"
                    ry="40"
                    fill="rgba(0, 45, 130, 0.65)"
                  />
                  <ellipse cx="470" cy="348" rx="70" ry="40" />
                  <line x1="400" y1="332" x2="400" y2="348" />
                  <line x1="540" y1="332" x2="540" y2="348" />
                  <polyline points="562,295 562,355 578,364 578,304" />
                  <polyline points="642,355 642,415 658,406 658,346" />
                  <polyline points="325,408 325,468 345,480 345,420" />

                  <polygon
                    points="930,210 1142,332 930,454 718,332"
                    fill="rgba(0, 58, 155, 0.45)"
                  />
                  <polygon
                    points="742,332 930,224 1085,314 1030,346 930,288 796,364"
                    fill="rgba(0, 75, 190, 0.55)"
                  />
                  <polyline points="742,332 742,420 796,452 796,364" />
                  <polyline points="796,364 930,288 1030,346 1030,434 930,376 796,452" />
                  <polyline points="1030,346 1085,314 1085,402 1030,434" />
                  <polygon points="818,320 854,298 854,352 818,374" />

                  <g>
                    <polygon
                      points="652,368 850,482 812,504 614,390"
                      fill="rgba(0, 75, 190, 0.6)"
                    />
                    <polyline points="614,390 614,474 812,588 850,566 850,482" />
                    <line x1="812" y1="504" x2="812" y2="588" />

                    <polygon
                      points="584,408 782,522 744,544 546,430"
                      fill="rgba(0, 75, 190, 0.6)"
                    />
                    <polyline points="546,430 546,514 744,628 782,606 782,522" />
                    <line x1="744" y1="544" x2="744" y2="628" />

                    <polygon
                      points="516,448 714,562 676,584 478,470"
                      fill="rgba(0, 75, 190, 0.6)"
                    />
                    <polyline points="478,470 478,554 676,668 714,646 714,562" />
                    <line x1="676" y1="584" x2="676" y2="668" />
                  </g>
                </g>
              </svg>
              </div>
            </div>

            <footer className="footer-fixed | overflow-hidden relative z-1">
              <div className="flex justify-center">
                <div
                  ref={footerCardRef}
                  className="footer | origin-top-right bg-[#283F7D] w-23/26 md:w-21/26 pt-32 pb-32 md:pt-48 md:pb-48 lg:pt-242 lg:pb-78 relative"
                >
                  <div className="footer-mark-frame | pointer-events-none relative lg:absolute top-0 inset-x-0 lg:inset-0 mx-auto lg:m-auto w-10/12 sm:w-10/11 lg:w-9/11 aspect-[1410/361]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1410"
                      height="361"
                      viewBox="0 0 1410 361"
                      fill="none"
                      className="absolute inset-0 size-full"
                      aria-hidden="true"
                    >
                      <g filter="url(#filter0_di_1571_3067)">
                        <path
                          d="M1352.12 92.8246C1352.12 75.3749 1365.76 64.1518 1381.06 64.1518C1396.36 64.1518 1410 75.3749 1410 92.8246C1410 110.351 1396.36 121.651 1381.06 121.651C1365.76 121.651 1352.12 110.351 1352.12 92.8246ZM1359.81 92.8246C1359.81 105.97 1369.23 115.502 1381.06 115.502C1392.74 115.502 1402.31 105.97 1402.31 92.8246C1402.31 79.7565 1392.74 70.3014 1381.06 70.3014C1369.23 70.3014 1359.81 79.7565 1359.81 92.8246ZM1369.83 108.891V76.6817H1381.74C1389.65 76.6817 1394.1 79.2185 1394.1 86.2137C1394.1 92.1328 1390.48 94.4389 1385.81 94.8232L1394.25 108.891H1387.69L1380.01 95.1307H1376.09V108.891H1369.83ZM1376.09 81.6783V90.1341H1381.66C1385.21 90.1341 1387.84 89.596 1387.84 85.6756C1387.84 82.2164 1384.23 81.6783 1381.36 81.6783H1376.09Z"
                          fill="#0B1941"
                          fillOpacity="0.3"
                          shapeRendering="crispEdges"
                        />
                        <path
                          d="M55.7762 357.006V105.356H111.06V357.006H55.7762ZM2 357.006V312.068H164.836V357.006H2ZM15.5697 150.293V105.356H111.06V150.293H15.5697ZM52.7607 63.9138V2H114.076V63.9138H52.7607Z"
                          fill="#0B1941"
                          fillOpacity="0.3"
                          shapeRendering="crispEdges"
                        />
                        <path
                          d="M244.319 357.006V3.49792H299.603V357.006H244.319ZM190.543 357.006V312.068H353.379V357.006H190.543ZM204.112 48.4353V3.49792H299.603V48.4353H204.112Z"
                          fill="#0B1941"
                          fillOpacity="0.3"
                          shapeRendering="crispEdges"
                        />
                        <path
                          d="M431.354 357.006V3.49792H486.637V357.006H431.354ZM377.577 357.006V312.068H540.414V357.006H377.577ZM391.147 48.4353V3.49792H486.637V48.4353H391.147Z"
                          fill="#0B1941"
                          fillOpacity="0.3"
                          shapeRendering="crispEdges"
                        />
                        <path
                          d="M680.206 361C655.077 361 632.628 355.508 612.86 344.523C593.092 333.205 577.512 317.893 566.12 298.587C555.063 278.948 549.535 256.479 549.535 231.181C549.535 211.874 552.718 194.399 559.084 178.754C565.45 163.109 574.496 149.461 586.223 137.811C597.95 126.16 611.687 117.173 627.435 110.848C643.517 104.524 661.108 101.362 680.206 101.362C705.67 101.362 728.119 106.854 747.552 117.839C767.32 128.823 782.732 144.135 793.789 163.775C805.181 183.081 810.877 205.55 810.877 231.181C810.877 250.154 807.694 267.63 801.328 283.608C794.962 299.253 785.748 312.9 773.686 324.551C761.959 336.201 748.222 345.189 732.474 351.513C716.727 357.838 699.304 361 680.206 361ZM680.206 314.065C691.263 314.065 701.314 312.068 710.361 308.074C719.407 303.746 727.281 297.921 733.982 290.598C740.683 283.275 745.877 274.62 749.562 264.634C753.248 254.315 755.09 242.998 755.09 230.682C755.09 214.371 751.907 200.057 745.541 187.741C739.175 175.425 730.297 165.772 718.905 158.782C707.848 151.791 694.948 148.296 680.206 148.296C669.149 148.296 658.93 150.293 649.548 154.288C640.502 158.282 632.628 163.941 625.927 171.264C619.561 178.587 614.535 187.408 610.85 197.727C607.164 207.714 605.321 218.698 605.321 230.682C605.321 247.325 608.504 261.971 614.87 274.62C621.236 286.937 630.115 296.59 641.507 303.58C652.899 310.57 665.798 314.065 680.206 314.065Z"
                          fill="#0B1941"
                          fillOpacity="0.3"
                          shapeRendering="crispEdges"
                        />
                        <path
                          d="M971.075 361C946.281 361 924.167 355.508 904.734 344.523C885.636 333.205 870.559 317.727 859.502 298.088C848.445 278.448 842.917 255.98 842.917 230.682C842.917 205.383 848.445 183.081 859.502 163.775C870.559 144.468 885.636 129.323 904.734 118.338C924.167 107.02 946.113 101.362 970.572 101.362C992.686 101.362 1012.12 105.19 1028.87 112.846C1045.62 120.169 1059.19 130.821 1069.58 144.801C1079.97 158.449 1086.5 175.092 1089.18 194.732H1032.89C1030.55 180.751 1023.68 169.6 1012.29 161.278C1001.23 152.624 987.492 148.296 971.075 148.296C957.338 148.296 944.941 151.791 933.884 158.782C923.162 165.772 914.618 175.425 908.252 187.741C901.886 200.057 898.703 214.371 898.703 230.682C898.703 246.992 901.886 261.472 908.252 274.121C914.618 286.437 923.162 296.257 933.884 303.58C944.941 310.57 957.338 314.065 971.075 314.065C983.137 314.065 993.523 311.902 1002.23 307.574C1011.28 303.247 1018.48 297.588 1023.85 290.598C1029.54 283.608 1033.06 275.952 1034.4 267.63H1091.19C1088.51 285.272 1081.81 301.25 1071.09 315.563C1060.7 329.544 1046.96 340.695 1029.88 349.017C1013.12 357.006 993.523 361 971.075 361Z"
                          fill="#0B1941"
                          fillOpacity="0.3"
                          shapeRendering="crispEdges"
                        />
                        <path
                          d="M1218.37 361C1200.61 361 1185.03 357.838 1171.63 351.513C1158.57 345.189 1148.35 336.534 1140.97 325.549C1133.94 314.232 1130.42 301.749 1130.42 288.102C1130.42 262.803 1139.63 243.497 1158.06 230.182C1176.49 216.535 1205.81 207.713 1246.01 203.719L1304.82 197.727V238.171L1248.02 244.662C1233.28 246.326 1221.22 248.823 1211.84 252.152C1202.46 255.147 1195.59 259.475 1191.23 265.134C1187.21 270.459 1185.2 277.283 1185.2 285.605C1185.2 296.257 1189.22 304.579 1197.26 310.57C1205.31 316.229 1216.19 319.058 1229.93 319.058C1244 319.058 1256.23 315.896 1266.62 309.572C1277.01 303.247 1285.05 294.426 1290.74 283.108C1296.44 271.458 1299.29 258.143 1299.29 243.164V193.733C1299.29 183.747 1296.77 175.092 1291.75 167.769C1287.06 160.446 1280.52 154.954 1272.15 151.292C1264.11 147.298 1254.56 145.3 1243.5 145.3C1227.75 145.3 1214.69 149.128 1204.3 156.784C1193.91 164.108 1187.55 174.926 1185.2 189.239H1131.43C1134.11 171.93 1140.47 156.784 1150.52 143.803C1160.91 130.488 1173.98 120.169 1189.73 112.846C1205.81 105.19 1223.9 101.362 1244 101.362C1265.45 101.362 1284.38 105.19 1300.8 112.846C1317.55 120.502 1330.62 131.653 1340 146.299C1349.38 160.612 1354.07 178.088 1354.07 198.726V357.006H1299.29V321.056C1294.93 328.379 1288.73 335.036 1280.69 341.028C1272.99 347.019 1263.77 351.846 1253.05 355.508C1242.66 359.169 1231.1 361 1218.37 361Z"
                          fill="#0B1941"
                          fillOpacity="0.3"
                          shapeRendering="crispEdges"
                        />
                      </g>
                      <defs>
                        <filter
                          id="filter0_di_1571_3067"
                          x="0"
                          y="0"
                          width="1411"
                          height="362"
                          filterUnits="userSpaceOnUse"
                          colorInterpolationFilters="sRGB"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dx="-1" dy="-1" />
                          <feGaussianBlur stdDeviation="0.5" />
                          <feComposite in2="hardAlpha" operator="out" />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow_1571_3067"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow_1571_3067"
                            result="shape"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dx="1" dy="1" />
                          <feGaussianBlur stdDeviation="1" />
                          <feComposite
                            in2="hardAlpha"
                            operator="arithmetic"
                            k2="-1"
                            k3="1"
                          />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0.0542252 0 0 0 0 0.103735 0 0 0 0 0.245192 0 0 0 0.7 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="shape"
                            result="effect2_innerShadow_1571_3067"
                          />
                        </filter>
                      </defs>
                    </svg>
                  </div>

                  <div className="footer-layout | flex-grid justify-center relative z-[2] mx-auto w-10/12 sm:w-10/11 lg:mx-0 lg:w-full px-0 mt-24 lg:mt-0 text-[#EADFC9]">
                    <div
                      data-footer-tagline=""
                      className="font-graphik text-[clamp(15px,4.5vw,18px)] lg:text-[clamp(24px,1.667vw,32px)] -tracking-2 lg:-tracking-3 w-full lg:w-4/12 leading-1.15 lg:leading-1.1 ml-0 lg:ml-44 mb-24 lg:mb-0"
                    >
                      <span className="block whitespace-nowrap">
                        AI-native design tools for
                      </span>
                      <span className="block whitespace-nowrap">
                        3D modeling and 2D drafting.
                      </span>
                    </div>

                    <div
                      data-footer-links=""
                      className="w-full lg:w-4/12 lg:offset-1/12 lg:mt-24 lg:pl-78 font-graphik -tracking-2 text-[13px] lg:text-[16px] leading-1.4"
                    >
                      <div className="flex gap-32 lg:gap-128 mb-20 lg:mb-32">
                        <div className="w-1/2 lg:w-auto min-w-0">
                          <h3 className="text-[#E76051] font-500 whitespace-nowrap">
                            {" Quick\u00A0links "}
                          </h3>
                          <ul className="text-[#EADFC9]">
                            {[
                              { label: "Home", href: "/" },
                              { label: "Plamo", href: "/" },
                              { label: "Tracing Paper", href: "/about" },
                              { label: "FAQs", href: "#faqs" },
                              { label: "Changelog", href: "/cad" },
                              { label: "Community", href: "/cad" },
                              { label: "Legal", href: "#footer" },
                            ].map((link) => (
                              <li key={link.label}>
                                <NavHoverLink
                                  href={link.href}
                                  label={link.label}
                                  className="leading-1.3 whitespace-nowrap"
                                  underlineVariant="accent"
                                />
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-[#E76051] font-500">Connect</h3>
                          <ul className="text-[#EADFC9]">
                            {[
                              {
                                label: "LinkedIn",
                                href: "https://www.linkedin.com/company/illoca/",
                              },
                              {
                                label: "X / Twitter",
                                href: "https://x.com/app_illoca",
                              },
                              {
                                label: "Instagram",
                                href: "https://www.instagram.com/app.illoca",
                              },
                              {
                                label: "hello@illoca.com",
                                href: "mailto:hello@illoca.com",
                              },
                            ].map((link) => (
                              <li key={link.label}>
                                <NavHoverLink
                                  href={link.href}
                                  label={link.label}
                                  target={
                                    link.href.startsWith("http")
                                      ? "_blank"
                                      : undefined
                                  }
                                  rel={
                                    link.href.startsWith("http")
                                      ? "noopener noreferrer"
                                      : undefined
                                  }
                                  className="leading-1.3 whitespace-nowrap"
                                  underlineVariant="accent"
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div
                        data-footer-legal=""
                        className="text-[#EADFC9] text-[12px] lg:text-[13px] lg:w-max whitespace-nowrap"
                      >
                        {" Copyright ©2026 illoca "}
                        <a
                          href="#terms"
                          className="ml-16 opacity-60 hover:opacity-100 transition-opacity"
                        >
                          Terms
                        </a>
                        <a
                          href="#privacy"
                          className="ml-16 opacity-60 hover:opacity-100 transition-opacity"
                        >
                          Privacy
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>

          {/* Cookie Consent Banner */}
          {!cookieDismissed && (
            <div
              className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-[10px] rounded-[2px] border border-[#9c9c9c] bg-[rgba(255,251,243,0.95)] py-[10px] pl-[16px] pr-[6px] min-[580px]:left-[28px] min-[580px]:translate-x-0 min-[580px]:flex-row min-[580px]:items-center min-[580px]:gap-[16px] min-[580px]:py-[6px]"
              role="dialog"
              aria-label="Cookie consent"
            >
              <p className="font-geist font-500 whitespace-nowrap text-[13px] -tracking-2 text-[#414141]">
                {" This website uses cookies. "}
                <a href="#cookies" className="underline">
                  Learn more
                </a>
                .
              </p>
              <div className="flex shrink-0 items-center gap-[8px]">
                <button
                  type="button"
                  onClick={() => setCookieDismissed(true)}
                  onPointerEnter={(e) => {
                    gsap.to(e.currentTarget, {
                      y: -2,
                      scale: 1.03,
                      backgroundColor: "#3B60C5",
                      color: "#FEF9F1",
                      duration: 0.25,
                      ease: "power3.out",
                      overwrite: "auto",
                    });
                  }}
                  onPointerLeave={(e) => {
                    gsap.to(e.currentTarget, {
                      y: 0,
                      scale: 1,
                      backgroundColor: "#fdf8f0",
                      color: "#212121",
                      duration: 0.25,
                      ease: "power3.out",
                      overwrite: "auto",
                    });
                  }}
                  className="flex shrink-0 cursor-pointer items-center justify-center gap-[10px] rounded-[4px] border border-[#a19d94] bg-[#fdf8f0] text-[#212121] py-[4px] pl-[4px] pr-[12px] drop-shadow-[3px_3px_0px_rgba(59,96,197,0.2)]"
                >
                  <span className="size-[28px] shrink-0">
                    <svg
                      viewBox="0 0 37 37"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-full w-full"
                    >
                      <rect width="37" height="37" rx="2" fill="#3B60C5" />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M26.5926 13.6484L16.9831 25.75L11 19.7221L12.8813 17.8547L16.7626 21.765L24.5167 12L26.5926 13.6484Z"
                        fill="#FEF9F1"
                      />
                    </svg>
                  </span>
                  <span className="font-geist font-500 whitespace-nowrap text-[13px] -tracking-2">
                    Accept
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setCookieDismissed(true)}
                  onPointerEnter={(e) => {
                    gsap.to(e.currentTarget, {
                      y: -2,
                      scale: 1.03,
                      backgroundColor: "#C53B3B",
                      color: "#FEF9F1",
                      duration: 0.25,
                      ease: "power3.out",
                      overwrite: "auto",
                    });
                  }}
                  onPointerLeave={(e) => {
                    gsap.to(e.currentTarget, {
                      y: 0,
                      scale: 1,
                      backgroundColor: "#fdf8f0",
                      color: "#212121",
                      duration: 0.25,
                      ease: "power3.out",
                      overwrite: "auto",
                    });
                  }}
                  className="flex shrink-0 cursor-pointer items-center justify-center gap-[10px] rounded-[4px] border border-[#a19d94] bg-[#fdf8f0] text-[#212121] py-[4px] pl-[4px] pr-[12px] drop-shadow-[3px_3px_0px_rgba(59,96,197,0.2)]"
                >
                  <span className="size-[28px] shrink-0">
                    <svg
                      viewBox="0 0 37 37"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-full w-full"
                    >
                      <rect width="37" height="37" rx="2" fill="#C53B3B" />
                      <path
                        d="M25.5 12L11.5 26M11.5 12.0001L25.5 26"
                        stroke="#FEF9F1"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="font-geist font-500 whitespace-nowrap text-[13px] -tracking-2">
                    Reject
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="js-page-cover | opacity-0 invisible fixed h-dvh inset-0 w-full z-100 bg-white" />
      <div className="grain" />
    </div>
  );
}
