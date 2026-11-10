"use client";

import {
  CheckCircle2,
  FileText,
  Plus,
  Ruler,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRequirements } from "./use-requirements";

export default function RequirementsPage() {
  const {
    briefText,
    setBriefText,
    plotWidth,
    setPlotWidth,
    plotDepth,
    setPlotDepth,
    rooms,
    setRooms,
    adjacencies,
    handleInterpretBrief,
    handleConfirm,
  } = useRequirements();

  return (
    <div className="tactile-editorial-root min-h-screen bg-[#FDF8F0] text-[#212121] font-mono flex flex-col">
      {/* Header */}
      <header className="bg-[#FDF8F0] border-b border-[#212121]/15 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#3B60C5] border border-[#212121] text-[#FFFBF3] flex items-center justify-center font-bold text-xs">
              BG
            </div>
            <span className="font-mono font-bold text-sm sm:text-base text-[#212121] tracking-wider uppercase">
              BUILDGEN
            </span>
          </Link>
          <span className="text-[#212121]/20">|</span>
          <span className="font-serif italic text-base sm:text-lg text-[#212121]">
            Brief &amp; Requirements
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 border border-[#212121]/25 bg-[#FFFBF3] text-[#212121] hover:border-[#212121] transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/studio"
            className="px-3 py-1.5 border border-[#212121]/25 bg-[#FFFBF3] text-[#212121] hover:border-[#212121] transition-colors"
          >
            ← Back to Studio
          </Link>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3B60C5] hover:bg-[#EC633D] text-[#FFFBF3] border border-[#212121] font-bold transition-colors shadow-[2px_2px_0px_#212121] cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            CONFIRM VERSION
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Natural Language Brief Intake Card */}
        <div className="border border-[#212121]/20 bg-[#FFFBF3] p-4 sm:p-5 shadow-[3px_3px_0px_rgba(33,33,33,0.06)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#3B60C5]" />
              <h2 className="font-sans font-bold text-sm text-[#212121] uppercase">
                1. Natural-Language Architectural Brief
              </h2>
            </div>
            <button
              type="button"
              onClick={handleInterpretBrief}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#3B60C5]/10 border border-[#3B60C5]/40 text-[#3B60C5] text-xs font-bold hover:bg-[#3B60C5] hover:text-[#FFFBF3] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI INTERPRET BRIEF
            </button>
          </div>

          <textarea
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            rows={3}
            className="w-full border border-[#212121]/25 bg-[#FDF8F0] p-2.5 font-mono text-xs text-[#212121] focus:border-[#3B60C5] outline-none leading-relaxed"
            placeholder="Describe your residential plot, room requirements, and spatial preferences..."
          />
        </div>

        {/* Plot Dimensions */}
        <div className="border border-[#212121]/20 bg-[#FFFBF3] p-4 sm:p-5 shadow-[3px_3px_0px_rgba(33,33,33,0.06)] space-y-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-[#3B60C5]" />
            <h2 className="font-sans font-bold text-sm text-[#212121] uppercase">
              2. Bounding Plot Dimensions (Canonical 10mm Grid)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[#5B5B5B] font-bold mb-1">
                PLOT SPAN / WIDTH (MM):
              </label>
              <input
                type="number"
                step="10"
                value={plotWidth}
                onChange={(e) => setPlotWidth(Number(e.target.value))}
                className="w-full border border-[#212121]/25 bg-[#FDF8F0] p-2 font-mono text-xs text-[#212121] focus:border-[#3B60C5] outline-none"
              />
              <span className="text-[10px] text-[#5B5B5B]">
                {(plotWidth / 1000).toFixed(2)} meters
              </span>
            </div>

            <div>
              <label className="block text-[#5B5B5B] font-bold mb-1">
                PLOT DEPTH (MM):
              </label>
              <input
                type="number"
                step="10"
                value={plotDepth}
                onChange={(e) => setPlotDepth(Number(e.target.value))}
                className="w-full border border-[#212121]/25 bg-[#FDF8F0] p-2 font-mono text-xs text-[#212121] focus:border-[#3B60C5] outline-none"
              />
              <span className="text-[10px] text-[#5B5B5B]">
                {(plotDepth / 1000).toFixed(2)} meters
              </span>
            </div>

            <div>
              <label className="block text-[#5B5B5B] font-bold mb-1">
                COMPUTED PLOT FOOTPRINT:
              </label>
              <div className="p-2 border border-[#212121]/20 bg-[#EAE0CE]/50 font-bold text-[#3B60C5] text-sm">
                {((plotWidth * plotDepth) / 1000000).toFixed(2)} m²
              </div>
              <span className="text-[10px] text-[#5B5B5B]">
                Approximately {((plotWidth * plotDepth) / 1000000 / 0.836127).toFixed(1)} Sq. Yards
              </span>
            </div>
          </div>
        </div>

        {/* Structured Rooms Table */}
        <div className="border border-[#212121]/20 bg-[#FFFBF3] p-4 sm:p-5 shadow-[3px_3px_0px_rgba(33,33,33,0.06)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-sans font-bold text-sm text-[#212121] uppercase">
              3. Room Instances &amp; Dimensional Bounds
            </h2>
            <button
              type="button"
              onClick={() => {
                const newId = `need_room_${Date.now()}`;
                setRooms([
                  ...rooms,
                  {
                    id: newId,
                    type: "bedroom",
                    min_width_mm: 3000,
                    max_width_mm: 5000,
                    min_area_m2: 12.0,
                    max_area_m2: 18.0,
                  },
                ]);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#EAE0CE] hover:bg-[#212121] hover:text-[#FFFBF3] text-[#212121] border border-[#212121]/30 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              ADD ROOM
            </button>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px] font-mono text-xs border border-[#212121]/20">
              <thead>
                <tr className="bg-[#EAE0CE]/70 text-[#212121] text-left border-b border-[#212121]/20 text-[10px]">
                  <th className="p-2">INSTANCE ID</th>
                  <th className="p-2">TYPE</th>
                  <th className="p-2 text-right">MIN WIDTH (MM)</th>
                  <th className="p-2 text-right">MAX WIDTH (MM)</th>
                  <th className="p-2 text-right">MIN AREA (M²)</th>
                  <th className="p-2 text-right">MAX AREA (M²)</th>
                  <th className="p-2 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.id} className="border-b border-[#212121]/10 hover:bg-[#FDF8F0]">
                    <td className="p-2 font-bold text-[#212121]">{r.id}</td>
                    <td className="p-2 text-[#3B60C5] font-bold uppercase">{r.type}</td>
                    <td className="p-2 text-right">{r.min_width_mm.toLocaleString()}</td>
                    <td className="p-2 text-right">
                      {r.max_width_mm ? r.max_width_mm.toLocaleString() : "—"}
                    </td>
                    <td className="p-2 text-right">{r.min_area_m2.toFixed(1)}</td>
                    <td className="p-2 text-right">
                      {r.max_area_m2 ? r.max_area_m2.toFixed(1) : "—"}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => setRooms(rooms.filter((item) => item.id !== r.id))}
                        className="text-[#5B5B5B] hover:text-[#EC633D] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Adjacency Matrix */}
        <div className="border border-[#212121]/20 bg-[#FFFBF3] p-4 sm:p-5 shadow-[3px_3px_0px_rgba(33,33,33,0.06)] space-y-3">
          <h2 className="font-sans font-bold text-sm text-[#212121] uppercase">
            4. Spatial Adjacency &amp; Access Constraints
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {adjacencies.map((adj, i) => (
              <div
                key={i}
                className="p-2.5 border border-[#212121]/15 bg-[#FDF8F0] flex items-center justify-between gap-2"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-[#212121] truncate">
                    {adj.room_a} ↔ {adj.room_b}
                  </div>
                  <div className="text-[10px] text-[#5B5B5B]">
                    RELATION: {adj.relation.toUpperCase()} • STRENGTH: {adj.strength.toUpperCase()}
                  </div>
                </div>
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-bold border shrink-0 ${
                    adj.strength === "hard"
                      ? "bg-[#3B60C5]/10 text-[#3B60C5] border-[#3B60C5]/30"
                      : "bg-[#EAE0CE] text-[#212121] border-[#212121]/20"
                  }`}
                >
                  {adj.strength === "hard" ? "MANDATORY" : "PREFERRED"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
