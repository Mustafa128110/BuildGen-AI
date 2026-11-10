"use client";

import { Box,X } from "lucide-react";
import React,{ useState } from "react";
import { FloorPlan } from "../model/types";

interface ThreeDModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FloorPlan;
}

export const ThreeDModal: React.FC<ThreeDModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [cameraView, setCameraView] = useState<"iso" | "top" | "front">("iso");
  const [wallHeight, setWallHeight] = useState(3000); // 3000mm = 3.0m

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 select-none">
      <div className="w-[880px] bg-white border-2 border-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-sky-400" />
            <span className="font-sans font-bold text-sm tracking-wider uppercase">
              REAL-TIME 3D VIEWPORT // {plan.project_name}
            </span>
            <span className="text-[10px] text-sky-300 border border-sky-500/40 px-1.5 py-0.2">
              WEBGL OPENGL ACCELERATED
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Toolbar */}
        <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold">CAMERA:</span>
            <button
              onClick={() => setCameraView("iso")}
              className={`px-2 py-0.5 border ${
                cameraView === "iso"
                  ? "bg-sky-700 text-white border-sky-800"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Axonometric 30°
            </button>
            <button
              onClick={() => setCameraView("top")}
              className={`px-2 py-0.5 border ${
                cameraView === "top"
                  ? "bg-sky-700 text-white border-sky-800"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Top Plan
            </button>
            <button
              onClick={() => setCameraView("front")}
              className={`px-2 py-0.5 border ${
                cameraView === "front"
                  ? "bg-sky-700 text-white border-sky-800"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Elevation Front
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-600">Storey Ht: 3,000mm</span>
            <span className="text-slate-600">Slab: 150mm RC</span>
            <span className="text-sky-800 font-bold">UNITS: METER</span>
          </div>
        </div>

        {/* 3D Scene Canvas Simulation */}
        <div className="h-[440px] bg-slate-950 relative overflow-hidden flex items-center justify-center p-6">
          {/* Grid lines in dark 3D perspective */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-70"></div>

          {/* Perspective 3D Building Mockup */}
          <div className="relative w-[540px] h-[340px] flex items-center justify-center">
            {/* Ground Slab */}
            <div
              style={{
                transform:
                  cameraView === "iso"
                    ? "rotateX(60deg) rotateZ(-30deg) translateZ(-20px)"
                    : cameraView === "top"
                    ? "rotateX(0deg)"
                    : "rotateX(85deg) translateY(60px)",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              className="w-[460px] h-[300px] border-2 border-sky-500 bg-sky-950/40 relative shadow-2xl"
            >
              {/* Slab Edge Depth */}
              <div className="absolute -bottom-2 -left-2 w-full h-full border border-sky-800 bg-sky-900/20 pointer-events-none"></div>

              {/* Extruded Room Zones in 3D */}
              {/* Living Area Block */}
              <div className="absolute top-4 left-4 w-[210px] h-[150px] border border-sky-400 bg-sky-500/20 flex flex-col justify-between p-2 shadow-lg">
                <div className="text-[10px] font-mono text-sky-200 font-bold">
                  LIVING ATRIUM (+3.4m)
                </div>
                <div className="text-[9px] font-mono text-sky-300">
                  Floor: Oak Parquet
                </div>
              </div>

              {/* Kitchen Block */}
              <div className="absolute top-4 left-[230px] w-[200px] h-[100px] border border-emerald-400 bg-emerald-500/20 flex flex-col justify-between p-2 shadow-lg">
                <div className="text-[10px] font-mono text-emerald-200 font-bold">
                  CHEF KITCHEN
                </div>
                <div className="text-[9px] font-mono text-emerald-300">
                  Window W-04 cut
                </div>
              </div>

              {/* Bedroom Block */}
              <div className="absolute top-[120px] left-[230px] w-[200px] h-[150px] border border-indigo-400 bg-indigo-500/20 flex flex-col justify-between p-2 shadow-lg">
                <div className="text-[10px] font-mono text-indigo-200 font-bold">
                  MASTER SUITE
                </div>
                <div className="text-[9px] font-mono text-indigo-300">
                  Acoustic Felt
                </div>
              </div>

              {/* Ensuite Bath */}
              <div className="absolute top-[170px] left-[110px] w-[100px] h-[100px] border border-cyan-400 bg-cyan-500/20 p-2 shadow-lg">
                <div className="text-[9px] font-mono text-cyan-200 font-bold">
                  ENSUITE
                </div>
              </div>

              {/* Terrace Loggia */}
              <div className="absolute top-[170px] left-4 w-[90px] h-[100px] border-2 border-dashed border-amber-400 bg-amber-500/20 p-2 shadow-lg">
                <div className="text-[9px] font-mono text-amber-200 font-bold">
                  LOGGIA
                </div>
                <div className="text-[8px] font-mono text-amber-300">
                  +1.2m Ext
                </div>
              </div>
            </div>
          </div>

          {/* Overlay Coordinates & Controls */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700 px-3 py-2 text-[10px] font-mono text-slate-300">
            <div>MESH REVISION: {plan.revision_badge}</div>
            <div>BUILDING VOLUME: 348.6 m³</div>
            <div>EXTRUDED WALL HEIGHT: {wallHeight} mm</div>
          </div>

          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => alert("IFC4 Geometry exported successfully.")}
              className="px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white font-mono text-xs font-bold border border-sky-500 transition-colors"
            >
              DOWNLOAD IFC4 MODEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
