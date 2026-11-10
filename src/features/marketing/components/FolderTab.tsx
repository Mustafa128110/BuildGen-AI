"use client";
import React from "react";
import { TAB_PATH_STANDARD,TAB_PATH_WIDE } from "../data/content";

export function FolderTab({
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
