"use client";
import gsap from "@/shared/animation";
import { useRef } from "react";

export function NavHoverLink({
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
        force3D: "auto",
      });
    }
    if (clipRef.current && lineRef.current) {
      gsap.to(clipRef.current, {
        xPercent: 0,
        duration: dur,
        ease,
        overwrite: true,
        force3D: "auto",
      });
      gsap.to(lineRef.current, {
        xPercent: 0,
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
    if (text1Ref.current && text2Ref.current) {
      gsap.to([text1Ref.current, text2Ref.current], {
        yPercent: 0,
        duration: dur,
        ease,
        overwrite: true,
        force3D: "auto",
      });
    }
    if (clipRef.current && lineRef.current) {
      gsap.to(clipRef.current, {
        xPercent: -105,
        duration: dur,
        ease,
        overwrite: true,
        force3D: "auto",
      });
      gsap.to(lineRef.current, {
        xPercent: 105,
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
