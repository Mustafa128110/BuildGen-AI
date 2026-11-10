"use client";
import gsap from "@/shared/animation";
import { useRef } from "react";

export function DrawbridgeButton({
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
    if (barRef.current) {
      gsap.to(barRef.current, {
        rotate: -90,
        svgOrigin: "8 28",
        duration: dur,
        ease,
        overwrite: true,
        force3D: "auto",
      });
    }
    if (text1Ref.current && text2Ref.current) {
      gsap.to([text1Ref.current, text2Ref.current], {
        yPercent: -100,
        color: textHoverColor,
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
    if (barRef.current) {
      gsap.to(barRef.current, {
        rotate: 0,
        svgOrigin: "8 28",
        duration: dur,
        ease,
        overwrite: true,
        force3D: "auto",
      });
    }
    if (text1Ref.current && text2Ref.current) {
      gsap.to([text1Ref.current, text2Ref.current], {
        yPercent: 0,
        color: textPrimaryColor,
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
