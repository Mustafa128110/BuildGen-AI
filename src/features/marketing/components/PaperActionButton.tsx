"use client";
import gsap from "@/shared/animation";
import { useRef } from "react";

export function PaperActionButton({
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
        force3D: "auto",
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
        force3D: "auto",
      });
      gsap.to(arrow2Ref.current, {
        scale: 1,
        svgOrigin: "19 19",
        duration: dur,
        ease,
        overwrite: true,
        force3D: "auto",
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
        force3D: "auto",
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
        force3D: "auto",
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
        force3D: "auto",
      });
      gsap.to(arrow2Ref.current, {
        scale: 0,
        svgOrigin: "19 19",
        duration: dur,
        ease,
        overwrite: true,
        force3D: "auto",
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
        force3D: "auto",
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
