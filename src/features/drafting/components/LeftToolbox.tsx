"use client";

import {
Compass,
DoorClosed,
Grid,
Grid2X2,
Layers,
MousePointer,
Redo2,
Ruler,
Square,
Undo2
} from "lucide-react";
import React from "react";
import { DraftingTool,LeadGrade,PenWeight,RoomType } from "../model/types";

interface LeftToolboxProps {
  activeTool: DraftingTool;
  onSelectTool: (tool: DraftingTool) => void;
  activePen: PenWeight;
  onSelectPen: (pen: PenWeight) => void;
  activeLead: LeadGrade;
  onSelectLead: (lead: LeadGrade) => void;
  onAddRoomPreset: (type: RoomType) => void;
  onToggleSnap: () => void;
  snapEnabled: boolean;
  isActivePanel?: boolean;
  onMouseEnter?: () => void;
  onUndoToolstrip?: () => void;
  canUndoToolstrip?: boolean;
  onRedoToolstrip?: () => void;
  canRedoToolstrip?: boolean;
}

export const LeftToolbox: React.FC<LeftToolboxProps> = ({
  activeTool,
  onSelectTool,
  activePen,
  onSelectPen,
  activeLead,
  onSelectLead,
  onAddRoomPreset,
  onToggleSnap,
  snapEnabled,
  isActivePanel = false,
  onMouseEnter,
  onUndoToolstrip,
  canUndoToolstrip = false,
  onRedoToolstrip,
  canRedoToolstrip = false,
}) => {
  return (
    <aside
      onMouseEnter={onMouseEnter}
      className={`w-72 bg-white border-r border-slate-300 flex flex-col justify-between h-full z-40 shrink-0 overflow-y-auto select-none transition-colors ${
        isActivePanel ? "ring-1 ring-inset ring-sky-500/30" : ""
      }`}
    >
      {/* Top Group: Title & Tool Tabs */}
      <div className="p-3 space-y-3">
        {/* Header: TOOLSTRIP */}
        <div className="px-2 py-2 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] text-slate-900 font-bold uppercase tracking-widest">
              TOOLSTRIP // ARCH-ORTHO
            </span>
            <span className={`inline-block w-2 h-2 rounded-full ${isActivePanel ? "bg-sky-600 animate-pulse" : "bg-slate-300"}`}></span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="font-mono text-[9px] text-slate-500">
              COORD: CARTESIAN (MM)
            </span>
            <span className={`font-mono text-[9px] font-bold px-1 py-0.2 border ${
              isActivePanel
                ? "bg-sky-50 text-sky-800 border-sky-300"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}>
              {isActivePanel ? "ACTIVE [Ctrl+Z to Undo]" : "IDLE"}
            </span>
          </div>
        </div>

        {/* Undo / Redo Row for Toolstrip */}
        {(onUndoToolstrip || onRedoToolstrip) && (
          <div className="flex items-center gap-1.5 px-2">
            <button
              onClick={onUndoToolstrip}
              disabled={!canUndoToolstrip}
              className={`flex-1 py-1 flex items-center justify-center gap-1 font-mono text-[10px] border transition-colors ${
                canUndoToolstrip
                  ? "border-slate-300 hover:bg-slate-50 text-slate-700 font-bold"
                  : "border-slate-200 text-slate-300 cursor-not-allowed"
              }`}
              title="Undo Tool/Pen Selection [Ctrl+Z]"
            >
              <Undo2 className="w-3 h-3" />
              <span>Undo Tool</span>
            </button>
            <button
              onClick={onRedoToolstrip}
              disabled={!canRedoToolstrip}
              className={`flex-1 py-1 flex items-center justify-center gap-1 font-mono text-[10px] border transition-colors ${
                canRedoToolstrip
                  ? "border-slate-300 hover:bg-slate-50 text-slate-700 font-bold"
                  : "border-slate-200 text-slate-300 cursor-not-allowed"
              }`}
              title="Redo Tool/Pen Selection [Ctrl+Y]"
            >
              <Redo2 className="w-3 h-3" />
              <span>Redo Tool</span>
            </button>
          </div>
        )}

        {/* Tool Tabs */}
        <div>
          <div className="font-mono text-[10px] text-slate-500 px-2 mb-1.5 tracking-wider uppercase font-semibold">
            ARCHITECTURAL TOOLS
          </div>
          <div className="space-y-1">
            {/* Pointer / Select [V] */}
            <button
              onClick={() => onSelectTool("select")}
              className={`w-full flex items-center justify-between px-3 py-2 transition-all font-mono text-[11px] ${
                activeTool === "select"
                  ? "bg-sky-50 text-sky-900 border-l-2 border-sky-600 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <MousePointer className="w-3.5 h-3.5 text-sky-700" />
                <span>Select & Move [V]</span>
              </div>
              <span className="text-[10px] text-slate-400">Pointer</span>
            </button>

            {/* Room [R] */}
            <button
              onClick={() => onSelectTool("room")}
              className={`w-full flex items-center justify-between px-3 py-2 transition-all font-mono text-[11px] ${
                activeTool === "room"
                  ? "bg-sky-50 text-sky-900 border-l-2 border-sky-600 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Square className="w-3.5 h-3.5 text-sky-700" />
                <span>Draw Room [R]</span>
              </div>
              <span className="text-[10px] text-sky-700 font-bold">Polygon</span>
            </button>

            {/* Door [D] */}
            <button
              onClick={() => onSelectTool("door")}
              className={`w-full flex items-center justify-between px-3 py-2 transition-all font-mono text-[11px] ${
                activeTool === "door"
                  ? "bg-sky-50 text-sky-900 border-l-2 border-sky-600 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <DoorClosed className="w-3.5 h-3.5 text-sky-700" />
                <span>Door Placer [D]</span>
              </div>
              <span className="text-[10px] text-slate-400">Swing 90°</span>
            </button>

            {/* Window [O] */}
            <button
              onClick={() => onSelectTool("window")}
              className={`w-full flex items-center justify-between px-3 py-2 transition-all font-mono text-[11px] ${
                activeTool === "window"
                  ? "bg-sky-50 text-sky-900 border-l-2 border-sky-600 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid2X2 className="w-3.5 h-3.5 text-sky-700" />
                <span>Window [O]</span>
              </div>
              <span className="text-[10px] text-slate-400">Casement</span>
            </button>

            {/* Dimension [M] */}
            <button
              onClick={() => onSelectTool("dimension")}
              className={`w-full flex items-center justify-between px-3 py-2 transition-all font-mono text-[11px] ${
                activeTool === "dimension"
                  ? "bg-sky-50 text-sky-900 border-l-2 border-sky-600 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Ruler className="w-3.5 h-3.5 text-sky-700" />
                <span>Dimension [M]</span>
              </div>
              <span className="text-[10px] text-slate-400">Metric (mm)</span>
            </button>
          </div>
        </div>

        {/* Section: Room & Fixture Presets */}
        <div className="pt-2 border-t border-slate-200">
          <div className="font-mono text-[10px] text-slate-500 px-2 mb-2 tracking-wider uppercase flex items-center justify-between font-semibold">
            <span>ROOM PRESETS</span>
            <span className="text-sky-700 text-[9px] font-bold">
              CLICK TO ADD
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 px-1 font-mono text-[11px]">
            <div
              onClick={() => onAddRoomPreset("bedroom")}
              className="p-2 border border-slate-200 bg-slate-50 hover:border-sky-600 hover:bg-sky-50/50 cursor-pointer transition-colors group"
            >
              <div className="text-slate-800 group-hover:text-sky-700 font-bold text-[10px]">
                Master Suite
              </div>
              <div className="text-slate-500 text-[9px] mt-0.5">24.5 m² • Bed</div>
            </div>
            <div
              onClick={() => onAddRoomPreset("kitchen")}
              className="p-2 border border-slate-200 bg-slate-50 hover:border-sky-600 hover:bg-sky-50/50 cursor-pointer transition-colors group"
            >
              <div className="text-slate-800 group-hover:text-sky-700 font-bold text-[10px]">
                Open Kitchen
              </div>
              <div className="text-slate-500 text-[9px] mt-0.5">18.2 m² • Island</div>
            </div>
            <div
              onClick={() => onAddRoomPreset("living")}
              className="p-2 border border-slate-200 bg-slate-50 hover:border-sky-600 hover:bg-sky-50/50 cursor-pointer transition-colors group"
            >
              <div className="text-slate-800 group-hover:text-sky-700 font-bold text-[10px]">
                Living Atrium
              </div>
              <div className="text-slate-500 text-[9px] mt-0.5">36.0 m² • Lounge</div>
            </div>
            <div
              onClick={() => onAddRoomPreset("terrace")}
              className="p-2 border border-slate-200 bg-slate-50 hover:border-sky-600 hover:bg-sky-50/50 cursor-pointer transition-colors group"
            >
              <div className="text-slate-800 group-hover:text-sky-700 font-bold text-[10px]">
                Terrace Loggia
              </div>
              <div className="text-slate-500 text-[9px] mt-0.5">14.4 m² • Deck</div>
            </div>
          </div>
        </div>

        {/* Section: Blueprint & Pen Calibration */}
        <div className="pt-2 border-t border-slate-200">
          <div className="font-mono text-[10px] text-slate-500 px-2 mb-2 tracking-wider uppercase font-semibold">
            DRAFTING CALIBRATION
          </div>
          {/* Stroke Weight */}
          <div className="px-2 space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-600">Rapidograph Pen:</span>
              <span className="text-sky-700 font-bold">{activePen}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(["0.25mm", "0.50mm", "1.00mm"] as PenWeight[]).map((pen) => (
                <button
                  key={pen}
                  onClick={() => onSelectPen(pen)}
                  className={`py-1 text-center font-mono text-[10px] border transition-colors ${
                    activePen === pen
                      ? "border-sky-600 bg-sky-50 text-sky-800 font-bold"
                      : "border-slate-300 text-slate-600 hover:border-sky-500 hover:bg-slate-50"
                  }`}
                >
                  {pen}
                </button>
              ))}
            </div>

            {/* Graphite Softness */}
            <div className="flex items-center justify-between font-mono text-[10px] pt-1">
              <span className="text-slate-600">Graphite Lead:</span>
              <span className="text-amber-800 font-bold">{activeLead}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(["2H Fine", "HB Norm", "2B Soft"] as LeadGrade[]).map((lead) => (
                <button
                  key={lead}
                  onClick={() => onSelectLead(lead)}
                  className={`py-1 text-center font-mono text-[10px] border transition-colors ${
                    activeLead === lead
                      ? "border-amber-500 bg-amber-50 text-amber-900 font-bold"
                      : "border-slate-300 text-slate-600 hover:border-amber-400 hover:bg-slate-50"
                  }`}
                >
                  {lead}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA: SNAP TO GRID */}
        <div className="px-1 pt-1">
          <button
            onClick={onToggleSnap}
            className={`w-full py-2 border flex items-center justify-center gap-2 font-mono text-[11px] tracking-wider transition-all font-semibold ${
              snapEnabled
                ? "bg-sky-50 border-sky-600 text-sky-800 shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
            }`}
          >
            <Grid className={`w-3.5 h-3.5 ${snapEnabled ? "text-sky-700" : "text-slate-500"}`} />
            {snapEnabled ? "SNAP 10mm [ACTIVE]" : "FREEHAND DRAFTING"}
          </button>
        </div>
      </div>

      {/* Footer Utility Actions */}
      <div className="p-2 border-t border-slate-300 bg-slate-50/80 space-y-1">
        <button
          onClick={() => alert("Materials Library: 15 finishes loaded (Oak Parquet, Slate Tile, Terrazzo, Teak Deck).")}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-slate-600 hover:text-sky-700 hover:bg-white transition-colors font-mono text-[10px]"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Materials & Finish Library</span>
        </button>
        <button
          onClick={() => alert("Ruler Calibration: 1:50 Metric Scale (100px = 2000mm).")}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-slate-600 hover:text-sky-700 hover:bg-white transition-colors font-mono text-[10px]"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Metric 1:50 Scale Calibration</span>
        </button>
      </div>
    </aside>
  );
};
