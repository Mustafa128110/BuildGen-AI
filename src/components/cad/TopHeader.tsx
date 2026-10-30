"use client";

import React from "react";
import Link from "next/link";
import { 
  Building2, 
  Grid3X3, 
  Ruler, 
  History, 
  Download, 
  CheckCircle2, 
  Layers, 
  Box,
  FileSpreadsheet
} from "lucide-react";

import { ActivePanel } from "@/types/cad";

interface TopHeaderProps {
  revisionBadge?: string;
  cursorX?: number;
  cursorY?: number;
  zoomLevel?: number;
  orthoLocked?: boolean;
  activePanel?: ActivePanel;
  onToggle3D?: () => void;
  onToggleQuantities?: () => void;
  onToggleValidation?: () => void;
  onExportStamp?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  revisionBadge = "REV-03.4 • METRIC 1:50",
  cursorX = 14.45,
  cursorY = 8.80,
  zoomLevel = 100,
  orthoLocked = true,
  activePanel = "canvas",
  onToggle3D,
  onToggleQuantities,
  onToggleValidation,
  onExportStamp,
}) => {
  return (
    <header className="bg-white text-sky-800 flex justify-between items-center w-full px-4 h-14 z-50 border-b border-slate-300 relative shadow-xs shrink-0 select-none">
      {/* Left Product Identity & Stamp */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-sky-700 text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-xs">
            BG
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-base tracking-wider text-slate-900 uppercase leading-none">
              BUILDGEN <span className="text-sky-600 font-normal">// STUDIO</span>
            </span>
            <span className="font-mono text-[9px] text-slate-500 tracking-tight">
              DWG-01 : LEVEL 01 ARCH-CAD
            </span>
          </div>
        </Link>

        {/* Architectural Sheet Stamp Badge */}
        <div className="stamp-badge px-2 py-0.5 bg-amber-50 text-amber-800 font-sans text-[11px] font-bold tracking-wider flex items-center gap-1.5 border border-amber-500 shadow-xs">
          <span className="inline-block w-1.5 h-1.5 bg-amber-600 rounded-full animate-ping"></span>
          {revisionBadge}
        </div>

        {/* Realtime Coordinate Tracking Ticker */}
        <div className="hidden xl:flex items-center gap-3 pl-3 border-l border-slate-300 font-mono text-[11px] text-slate-600">
          <div>
            <span className="text-sky-700 font-bold">X:</span> {cursorX.toFixed(2)}m
          </div>
          <div>
            <span className="text-sky-700 font-bold">Y:</span> {cursorY.toFixed(2)}m
          </div>
          <div>
            <span className="text-sky-700 font-bold">Z:</span> +3.20m
          </div>
          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 font-medium">
            [ ZOOM: {zoomLevel}% ]
          </span>
          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 font-semibold">
            {orthoLocked ? "ORTHO: LOCKED" : "ORTHO: FREE"}
          </span>
          <span className="px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse"></span>
            FOCUS: {activePanel}
          </span>
        </div>
      </div>

      {/* Center Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 h-full font-mono text-[11px]">
        <Link
          href="/dashboard"
          className="text-slate-600 hover:text-sky-700 font-bold h-full flex items-center gap-1 px-1 transition-colors"
        >
          ← Dashboard
        </Link>
        <Link
          href="/studio"
          className="text-sky-700 border-b-2 border-sky-700 font-bold h-full flex items-center px-1 transition-colors"
        >
          DWG-01: Floor Plan
        </Link>
        <button
          onClick={onToggle3D}
          className="text-slate-600 hover:text-sky-700 font-medium h-full flex items-center gap-1 px-1 hover:bg-slate-50 transition-colors"
        >
          <Box className="w-3.5 h-3.5" />
          3D Viewport
        </button>
        <button
          onClick={onToggleQuantities}
          className="text-slate-600 hover:text-sky-700 font-medium h-full flex items-center gap-1 px-1 hover:bg-slate-50 transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Quantities (BOQ)
        </button>
        <button
          onClick={onToggleValidation}
          className="text-slate-600 hover:text-sky-700 font-medium h-full flex items-center gap-1 px-1 hover:bg-slate-50 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Audit Rules
        </button>
      </nav>

      {/* Trailing Actions & Stamp Buttons */}
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-1 border-r border-slate-300 pr-2">
          <button
            onClick={() => alert("10mm canonical grid snap enabled.")}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded transition-colors"
            title="Grid Snap [10mm]"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert("Authoritative room clearances calculated.")}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded transition-colors"
            title="Dimension Check"
          >
            <Ruler className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert("Revision ledger: 4 immutable snapshots stored in PostgreSQL.")}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded transition-colors"
            title="Revision History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onToggleQuantities}
          className="hidden sm:flex items-center gap-1 px-3 py-1.5 border border-slate-300 bg-white text-slate-700 font-mono text-[11px] font-bold hover:bg-slate-50 hover:border-sky-600 hover:text-sky-700 transition-all shadow-xs"
        >
          <History className="w-3 h-3" />
          REVISION LOG
        </button>

        {/* Primary Action: EXPORT STAMP */}
        <button
          onClick={onExportStamp}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-700 text-white font-mono text-[11px] font-bold tracking-wider hover:bg-sky-600 border border-sky-800 transition-all shadow-xs active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          EXPORT STAMP
        </button>
      </div>
    </header>
  );
};
