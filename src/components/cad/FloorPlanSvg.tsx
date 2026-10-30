"use client";

import React, { useState, useRef } from "react";
import { FloorPlan, Room, DraftingTool } from "@/types/cad";
import { 
  Move, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  Eraser, 
  Edit3, 
  CheckSquare 
} from "lucide-react";

interface FloorPlanSvgProps {
  plan: FloorPlan;
  activeTool: DraftingTool;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
  onUpdateCoordinates?: (xMeters: number, yMeters: number) => void;
  showFurnLayer?: boolean;
  showHvacLayer?: boolean;
  showDimsLayer?: boolean;
}

export const FloorPlanSvg: React.FC<FloorPlanSvgProps> = ({
  plan,
  activeTool,
  selectedRoomId,
  onSelectRoom,
  onUpdateCoordinates,
}) => {
  const [zoom, setZoom] = useState(1);
  const [showFurn, setShowFurn] = useState(true);
  const [showHvac, setShowHvac] = useState(true);
  const [showDims, setShowDims] = useState(true);
  const [graphiteOverlay, setGraphiteOverlay] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle live coordinate tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onUpdateCoordinates) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    
    // Scale: 780px = 14450mm = 14.45m
    const xMeters = (px / 780) * 14.45;
    const yMeters = (py / 520) * 9.80;
    onUpdateCoordinates(
      Math.max(0, Math.min(18.0, xMeters)),
      Math.max(0, Math.min(12.0, yMeters))
    );
  };

  return (
    <section className="flex-1 flex flex-col relative overflow-hidden bg-slate-100 select-none">
      {/* Top Technical Ruler */}
      <div className="h-6 w-full bg-slate-50 border-b border-slate-300 flex items-center relative overflow-hidden shrink-0">
        <div className="w-8 h-full bg-slate-200/70 border-r border-slate-300 flex items-center justify-center font-mono text-[10px] text-slate-800 font-bold">
          0,0
        </div>
        <div className="flex-1 h-full ruler-top-ticks flex items-center justify-between px-4 font-mono text-[10px] text-slate-500">
          <span>0.00m</span>
          <span>2.00m</span>
          <span>4.00m</span>
          <span>6.00m</span>
          <span>8.00m</span>
          <span>10.00m</span>
          <span>12.00m</span>
          <span>14.00m</span>
          <span>16.00m</span>
          <span>18.00m</span>
        </div>
      </div>

      {/* Canvas Interior with Left Ruler and Main Grid */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Technical Ruler */}
        <div className="w-6 bg-slate-50 border-r border-slate-300 h-full ruler-left-ticks flex flex-col justify-between py-4 font-mono text-[10px] text-slate-500 shrink-0 items-center">
          <span>0.0</span>
          <span>2.0</span>
          <span>4.0</span>
          <span>6.0</span>
          <span>8.0</span>
          <span>10.0</span>
          <span>12.0</span>
        </div>

        {/* The Blueprint Canvas Area: White Architectural Vellum with Cyan Grid */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="flex-1 h-full blueprint-grid-canvas relative overflow-auto cursor-crosshair p-6 flex items-center justify-center"
        >
          {/* Architectural Registration Corner Marks */}
          <div className="absolute top-3 left-3 font-mono text-[11px] text-sky-700/80 font-bold">
            + [X0:Y0]
          </div>
          <div className="absolute top-3 right-3 font-mono text-[11px] text-sky-700/80 font-bold">
            [X145:Y0] +
          </div>
          <div className="absolute bottom-3 left-3 font-mono text-[11px] text-sky-700/80 font-bold">
            + [X0:Y98]
          </div>
          <div className="absolute bottom-3 right-3 font-mono text-[11px] text-sky-700/80 font-bold">
            [X145:Y98] +
          </div>

          {/* FLOATING CANVAS TOOLBAR */}
          <div className="absolute top-4 left-6 z-20 flex items-center gap-1.5 p-1 bg-white/95 border border-slate-300 backdrop-blur-sm shadow-md">
            <button
              onClick={() => alert("Pan view mode [Space + Drag]")}
              className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-slate-100 transition-colors"
              title="Pan View [Space]"
            >
              <Move className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-slate-100 transition-colors"
              title="Zoom Extents"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-5 bg-slate-300"></div>

            <button
              onClick={() => setGraphiteOverlay(!graphiteOverlay)}
              className={`px-2 py-1 border flex items-center gap-1 font-mono text-[10px] font-bold transition-colors ${
                graphiteOverlay
                  ? "bg-sky-50 text-sky-800 border-sky-400"
                  : "bg-white text-slate-500 border-slate-300"
              }`}
              title="Toggle Graphite Overlay"
            >
              <Edit3 className="w-3 h-3" />
              GRAPHITE OVERLAY
            </button>

            <div className="w-[1px] h-5 bg-slate-300"></div>

            {/* Quick Layer Toggles */}
            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-700 px-1 font-medium">
              <label className="flex items-center gap-1 cursor-pointer hover:text-sky-700">
                <input
                  type="checkbox"
                  checked={showFurn}
                  onChange={(e) => setShowFurn(e.target.checked)}
                  className="w-3 h-3 border-slate-400 text-sky-600 focus:ring-0 rounded-none"
                />
                <span>Furn</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer hover:text-sky-700">
                <input
                  type="checkbox"
                  checked={showHvac}
                  onChange={(e) => setShowHvac(e.target.checked)}
                  className="w-3 h-3 border-slate-400 text-sky-600 focus:ring-0 rounded-none"
                />
                <span>HVAC</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer hover:text-sky-700">
                <input
                  type="checkbox"
                  checked={showDims}
                  onChange={(e) => setShowDims(e.target.checked)}
                  className="w-3 h-3 border-slate-400 text-sky-600 focus:ring-0 rounded-none"
                />
                <span>Dims</span>
              </label>
            </div>
          </div>

          {/* ================================================================= */}
          {/* DETAILED ARCHITECTURAL FLOOR PLAN DRAWING BOARD */}
          {/* ================================================================= */}
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
            className="relative w-[780px] h-[520px] border-2 border-slate-800 bg-white/95 crosshair-corner shadow-xl transition-transform duration-100"
          >
            {/* Dimension Line: Top Overall (14,450 mm) */}
            {showDims && (
              <div className="absolute -top-7 left-10 right-10 flex items-center">
                <div className="w-2 h-2 border-l-2 border-t-2 border-sky-700 rotate-45"></div>
                <div className="flex-1 h-[1.5px] bg-sky-700 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 font-mono text-[10px] text-sky-800 font-bold border border-sky-300 shadow-xs">
                    14,450 mm [TOTAL SPAN]
                  </div>
                </div>
                <div className="w-2 h-2 border-r-2 border-b-2 border-sky-700 rotate-45"></div>
              </div>
            )}

            {/* Dimension Line: Left Overall (9,800 mm) */}
            {showDims && (
              <div className="absolute -left-7 top-10 bottom-10 flex flex-col items-center">
                <div className="w-2 h-2 border-l-2 border-t-2 border-sky-700 rotate-45"></div>
                <div className="flex-1 w-[1.5px] bg-sky-700 relative">
                  <div className="absolute -left-7 top-1/2 -translate-y-1/2 -rotate-90 bg-white px-2 font-mono text-[10px] text-sky-800 font-bold whitespace-nowrap border border-sky-300 shadow-xs">
                    9,800 mm
                  </div>
                </div>
                <div className="w-2 h-2 border-r-2 border-b-2 border-sky-700 rotate-45"></div>
              </div>
            )}

            {/* ROOM 1: LIVING & ATRIUM (Left-Center) */}
            <div
              onClick={() => onSelectRoom("r1")}
              className={`absolute top-10 left-10 w-[380px] h-[260px] border-2 transition-all p-3 flex flex-col justify-between cursor-pointer ${
                selectedRoomId === "r1"
                  ? "border-sky-600 bg-sky-50/80 ring-2 ring-sky-400"
                  : "border-slate-900 bg-slate-50/70 hover:border-sky-700"
              } ${graphiteOverlay ? "pencil-hatch-pattern" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-sans text-sm font-bold text-slate-900 tracking-wide">
                    LIVING & ATRIUM
                  </div>
                  <div className="font-mono text-[10px] text-sky-800 font-bold">
                    [36.2 m² • FIN. OAK PARQUET]
                  </div>
                  <div className="font-mono text-[9px] text-slate-600 mt-0.5">
                    CLG HT: +3,400mm AFF
                  </div>
                </div>
                {/* Door Swing to Garden */}
                <div className="relative w-14 h-14 border-r-2 border-b-2 border-dashed border-sky-600 rounded-br-full flex items-end justify-end">
                  <span className="font-mono text-[8px] text-sky-700 font-bold pr-1 pb-1">
                    D-01 (90°)
                  </span>
                </div>
              </div>

              {/* Interior Sketch Elements: Sofa Silhouette & Hearth */}
              {showFurn && (
                <div className="flex items-center justify-between border-t border-dashed border-slate-400 pt-2">
                  <div className="px-2 py-1 border border-slate-400 text-[9px] font-mono text-slate-800 bg-white font-medium">
                    MODULAR SEATING ZONE
                  </div>
                  <div className="font-mono text-[10px] text-slate-900 font-bold">
                    SPAN: 6,450 mm
                  </div>
                </div>
              )}
            </div>

            {/* ROOM 2: CHEF KITCHEN & PANTRY (Top-Right) */}
            <div
              onClick={() => onSelectRoom("r2")}
              className={`absolute top-10 left-[410px] w-[330px] h-[170px] border-2 transition-all p-3 flex flex-col justify-between cursor-pointer ${
                selectedRoomId === "r2"
                  ? "border-sky-600 bg-sky-50/80 ring-2 ring-sky-400"
                  : "border-slate-900 bg-slate-50/70 hover:border-sky-700"
              }`}
            >
              <div>
                <div className="font-sans text-sm font-bold text-slate-900 tracking-wide">
                  CHEF KITCHEN & PANTRY
                </div>
                <div className="font-mono text-[10px] text-sky-800 font-bold">
                  [18.5 m² • POLISHED TERRAZZO]
                </div>
                {/* Triple Pane Casement Window Indicator */}
                <div className="mt-2 w-full h-3 border-y-2 border-slate-800 flex items-center justify-around bg-sky-50">
                  <div className="w-1/3 h-[1.5px] bg-sky-600"></div>
                  <div className="w-1/3 h-[1.5px] bg-sky-600"></div>
                  <div className="w-1/3 h-[1.5px] bg-sky-600"></div>
                </div>
                <div className="text-[8px] font-mono text-slate-600 text-center mt-0.5 font-medium">
                  W-04 CASEMENT [3,200 x 1,400mm]
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-dashed border-slate-400 pt-1 font-mono text-[9px]">
                <span className="text-slate-800 font-medium">
                  PREP ISLAND: 3,000 x 1,100
                </span>
                <span className="text-amber-700 font-bold">DWG #KT-02</span>
              </div>
            </div>

            {/* ROOM 3: PRIMARY BEDROOM SUITE (Bottom-Right) */}
            <div
              onClick={() => onSelectRoom("r3")}
              className={`absolute top-[200px] left-[410px] w-[330px] h-[190px] border-2 transition-all p-3 flex flex-col justify-between cursor-pointer ${
                selectedRoomId === "r3"
                  ? "border-sky-600 bg-sky-50/80 ring-2 ring-sky-400"
                  : "border-slate-900 bg-slate-50/70 hover:border-sky-700"
              } ${graphiteOverlay ? "pencil-hatch-pattern" : ""}`}
            >
              <div>
                <div className="font-sans text-sm font-bold text-slate-900 tracking-wide">
                  PRIMARY BEDROOM SUITE
                </div>
                <div className="font-mono text-[10px] text-sky-800 font-bold">
                  [24.0 m² • ACOUSTIC FELT / WOOL]
                </div>
              </div>
              {/* King Bed Footprint Indicator */}
              {showFurn && (
                <div className="border border-slate-400 p-2 bg-white flex items-center justify-between font-mono text-[9px]">
                  <span className="text-slate-600 font-medium">
                    BED KING (2,000 x 2,100)
                  </span>
                  <span className="text-slate-900 font-bold">CLR: 1,150mm</span>
                </div>
              )}
              {/* Door Swing into Ensuite */}
              <div className="flex items-center justify-between font-mono text-[9px] border-t border-dashed border-slate-400 pt-1">
                <div className="relative w-8 h-8 border-l-2 border-b-2 border-dashed border-sky-600 rounded-bl-full"></div>
                <span className="text-sky-700 font-bold">D-03 (850mm SWING)</span>
                <span className="text-slate-700 font-bold">WIC ADJOIN</span>
              </div>
            </div>

            {/* ROOM 4: EN-SUITE SPA BATH (Bottom-Center) */}
            <div
              onClick={() => onSelectRoom("r4")}
              className={`absolute top-[290px] left-[200px] w-[190px] h-[190px] border-2 transition-all p-2.5 flex flex-col justify-between cursor-pointer ${
                selectedRoomId === "r4"
                  ? "border-sky-600 bg-sky-100/90 ring-2 ring-sky-400"
                  : "border-slate-900 bg-sky-50/50 hover:border-sky-700"
              }`}
            >
              <div>
                <div className="font-sans text-xs font-bold text-slate-900">
                  EN-SUITE SPA BATH
                </div>
                <div className="font-mono text-[10px] text-sky-800 font-bold">
                  [9.8 m² • SLATE TILE]
                </div>
              </div>
              <div className="text-[9px] font-mono text-slate-700 space-y-1 font-medium">
                <div className="flex justify-between">
                  <span>WALK-IN SHOWER:</span>{" "}
                  <span className="text-sky-700 font-bold">1200x900</span>
                </div>
                <div className="flex justify-between">
                  <span>SOAKING TUB:</span>{" "}
                  <span className="text-sky-700 font-bold">R 800mm</span>
                </div>
              </div>
              <div className="font-mono text-[9px] text-slate-600 border-t border-slate-300 pt-1 text-center font-bold">
                DRAINAGE SLOPE: 1:50
              </div>
            </div>

            {/* ROOM 5: TERRACE LOGGIA (Bottom-Left) */}
            <div
              onClick={() => onSelectRoom("r5")}
              className={`absolute top-[290px] left-10 w-[170px] h-[190px] border-2 border-dashed transition-all p-2.5 flex flex-col justify-between cursor-pointer ${
                selectedRoomId === "r5"
                  ? "border-amber-600 bg-amber-100/90 ring-2 ring-amber-400"
                  : "border-amber-600 bg-amber-50/60 hover:border-amber-700"
              }`}
            >
              <div>
                <div className="font-sans text-xs font-bold text-amber-900">
                  TERRACE LOGGIA
                </div>
                <div className="font-mono text-[10px] text-amber-800 font-bold">
                  [14.4 m² • TEAK DECK]
                </div>
              </div>
              <div className="font-mono text-[9px] text-slate-700 border border-amber-300 p-1 bg-white">
                <div>+1.2m EXPANSION ZONE</div>
                <div className="text-amber-700 font-bold">AI CO-PILOT PROPOSED</div>
              </div>
              <div className="font-mono text-[9px] text-amber-800 text-right font-bold">
                OUTDOOR SOFFIT
              </div>
            </div>

            {/* NORTH ARROW COMPASS ROSE */}
            <div className="absolute top-4 right-4 w-16 h-16 pointer-events-none flex flex-col items-center justify-center">
              <svg
                className="w-12 h-12 text-slate-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                ></circle>
                <circle cx="50" cy="50" r="38" strokeWidth="1"></circle>
                <polygon
                  fill="currentColor"
                  points="50,12 56,50 50,44 44,50"
                ></polygon>
                <polygon
                  fill="none"
                  points="50,88 56,50 50,44 44,50"
                  strokeWidth="1"
                ></polygon>
                <text
                  fill="currentColor"
                  fontFamily="'Space Grotesk', sans-serif"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  x="50"
                  y="9"
                >
                  N
                </text>
              </svg>
              <span className="font-mono text-[8px] text-slate-700 font-bold tracking-widest -mt-1">
                TRUE NORTH
              </span>
            </div>

            {/* ARCHITECTURAL SCALE BAR (Bottom Left Corner) */}
            <div className="absolute bottom-3 left-12 flex flex-col gap-1 pointer-events-none">
              <div className="flex items-center text-[8px] font-mono text-slate-800 font-bold justify-between w-48">
                <span>0m</span>
                <span>2m</span>
                <span>5m</span>
                <span>10m</span>
              </div>
              <div className="w-48 h-2 border border-slate-800 flex">
                <div className="w-12 h-full bg-slate-900"></div>
                <div className="w-12 h-full bg-transparent"></div>
                <div className="w-12 h-full bg-slate-900"></div>
                <div className="w-12 h-full bg-transparent"></div>
              </div>
              <span className="text-[8px] font-mono text-slate-600 font-medium">
                BAR SCALE 1:50 METRIC
              </span>
            </div>

            {/* OFFICIAL DRAFTING TITLE BLOCK STAMP (Lower Right Corner) */}
            <div className="absolute bottom-3 right-3 w-72 border-2 border-slate-900 bg-white p-2 text-slate-900 font-mono shadow-md">
              <div className="border-b-2 border-slate-900 pb-1 flex justify-between items-center font-sans">
                <span className="font-bold text-slate-900 tracking-wider text-[11px]">
                  BUILDGEN // DRAFTING RECORD
                </span>
                <span className="text-amber-800 font-bold bg-amber-50 px-1 py-0.5 border border-amber-300 text-[10px]">
                  APPROVED
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 py-1 text-[9px] border-b border-slate-300">
                <div>
                  <span className="text-slate-500">PROJECT:</span>{" "}
                  <span className="font-bold text-slate-900">
                    {plan.project_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">SHEET:</span>{" "}
                  <span className="font-bold text-slate-900">{plan.sheet_id}</span>
                </div>
                <div>
                  <span className="text-slate-500">ARCHITECT:</span>{" "}
                  <span className="font-bold text-slate-900">STUDIO ARCH-AI</span>
                </div>
                <div>
                  <span className="text-slate-500">DATE:</span>{" "}
                  <span className="font-bold text-slate-900">2026-10-28</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 text-[8px] text-slate-600">
                <span className="font-mono">REG #4892-CAD-SZABIST</span>
                <span className="text-sky-700 font-bold">{plan.scale_str}</span>
              </div>
            </div>
          </div>

          {/* Bottom Floating Status Bar within Canvas */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/95 border border-slate-300 flex items-center gap-4 font-mono text-[10px] text-slate-700 shadow-md">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-sky-600 rounded-full"></span>
              ACTIVE TOOL: {activeTool.toUpperCase()}
            </span>
            <span className="text-slate-300">|</span>
            <span>SNAP: 10mm CANONICAL</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-900 font-bold">
              WALL THICKNESS: 200mm DOUBLE-LINE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
