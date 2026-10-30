"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  Ruler, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";

interface RoomRequirement {
  id: string;
  type: string;
  min_width_mm: number;
  max_width_mm: number | null;
  min_area_m2: number;
  max_area_m2: number | null;
}

interface AdjacencyRequirement {
  room_a: string;
  room_b: string;
  relation: "door" | "wall";
  strength: "hard" | "soft";
}

export default function RequirementsPage() {
  const [briefText, setBriefText] = useState(
    "A 240 sq.yd single-storey concept with a spacious living atrium, master bedroom suite with ensuite bath, modern chef kitchen with pantry island, and an outdoor terrace loggia."
  );

  const [plotWidth, setPlotWidth] = useState(14450); // mm
  const [plotDepth, setPlotDepth] = useState(9800); // mm

  const [rooms, setRooms] = useState<RoomRequirement[]>([
    {
      id: "need_living",
      type: "living",
      min_width_mm: 4500,
      max_width_mm: 8000,
      min_area_m2: 30.0,
      max_area_m2: 45.0,
    },
    {
      id: "need_kitchen",
      type: "kitchen",
      min_width_mm: 3000,
      max_width_mm: 6000,
      min_area_m2: 15.0,
      max_area_m2: 25.0,
    },
    {
      id: "need_bedroom",
      type: "bedroom",
      min_width_mm: 3600,
      max_width_mm: 6000,
      min_area_m2: 20.0,
      max_area_m2: 30.0,
    },
    {
      id: "need_bath",
      type: "bath",
      min_width_mm: 2000,
      max_width_mm: 3500,
      min_area_m2: 8.0,
      max_area_m2: 14.0,
    },
    {
      id: "need_terrace",
      type: "terrace",
      min_width_mm: 2500,
      max_width_mm: 5000,
      min_area_m2: 12.0,
      max_area_m2: 20.0,
    },
  ]);

  const [adjacencies, setAdjacencies] = useState<AdjacencyRequirement[]>([
    { room_a: "need_living", room_b: "need_kitchen", relation: "door", strength: "hard" },
    { room_a: "need_living", room_b: "need_terrace", relation: "door", strength: "hard" },
    { room_a: "need_bedroom", room_b: "need_bath", relation: "door", strength: "hard" },
    { room_a: "need_living", room_b: "need_bedroom", relation: "wall", strength: "soft" },
  ]);

  const [confirmedVersion, setConfirmedVersion] = useState<string | null>(null);

  // AI Interpretation simulation (E43)
  const handleInterpretBrief = () => {
    alert(
      "AI Brief Interpretation (E43):\nExtracted 5 required rooms, plot boundary 14.45m x 9.80m, and 3 hard door connectivity requirements. Fields populated."
    );
  };

  const handleConfirm = () => {
    const vId = `REQ-V${Math.floor(Math.random() * 90 + 10)}`;
    setConfirmedVersion(vId);
    alert(
      `REQUIREMENTS CONFIRMED!\n\nVersion ID: ${vId}\nStatus: IMMUTABLE SNAPSHOT SAVED\n\nYou can now load this confirmed brief into the CAD Studio generator.`
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-mono flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-300 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-sky-700 text-white flex items-center justify-center font-bold text-sm">
              BG
            </div>
            <span className="font-sans font-bold text-lg text-slate-900 tracking-wider uppercase">
              BUILDGEN <span className="text-sky-600 font-normal">// BRIEF & REQUIREMENTS</span>
            </span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 text-xs">SPECIFICATION ENGINE (F2)</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/studio"
            className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:text-sky-700 hover:bg-slate-50 transition-colors"
          >
            ← Back to CAD Studio
          </Link>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-700 hover:bg-sky-600 text-white font-bold transition-all shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            CONFIRM VERSION
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        {/* Natural Language Brief Intake Card */}
        <div className="border border-slate-300 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-700" />
              <h2 className="font-sans font-bold text-sm text-slate-900 uppercase">
                1. Natural Language Architectural Brief (FR-F1-01)
              </h2>
            </div>
            <button
              onClick={handleInterpretBrief}
              className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-400 text-sky-800 text-xs font-bold hover:bg-sky-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI INTERPRET BRIEF [E43]
            </button>
          </div>

          <textarea
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            rows={3}
            className="w-full border border-slate-300 p-2.5 font-mono text-xs focus:border-sky-600 outline-none leading-relaxed"
            placeholder="Type your design requirements..."
          />
        </div>

        {/* Plot Dimensions */}
        <div className="border border-slate-300 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-sky-700" />
            <h2 className="font-sans font-bold text-sm text-slate-900 uppercase">
              2. Bounding Plot Dimensions (Canonical Integer Millimeters)
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">
                PLOT SPAN / WIDTH (MM):
              </label>
              <input
                type="number"
                step="10"
                value={plotWidth}
                onChange={(e) => setPlotWidth(Number(e.target.value))}
                className="w-full border border-slate-300 p-2 font-mono text-xs focus:border-sky-600 outline-none"
              />
              <span className="text-[10px] text-slate-500">
                {(plotWidth / 1000).toFixed(2)} meters
              </span>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">
                PLOT DEPTH (MM):
              </label>
              <input
                type="number"
                step="10"
                value={plotDepth}
                onChange={(e) => setPlotDepth(Number(e.target.value))}
                className="w-full border border-slate-300 p-2 font-mono text-xs focus:border-sky-600 outline-none"
              />
              <span className="text-[10px] text-slate-500">
                {(plotDepth / 1000).toFixed(2)} meters
              </span>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">
                COMPUTED PLOT FOOTPRINT:
              </label>
              <div className="p-2 border border-slate-200 bg-slate-50 font-bold text-sky-800 text-sm">
                {((plotWidth * plotDepth) / 1000000).toFixed(2)} m²
              </div>
              <span className="text-[10px] text-slate-500">
                Approximately {((plotWidth * plotDepth) / 1000000 / 0.836127).toFixed(1)} Sq. Yards
              </span>
            </div>
          </div>
        </div>

        {/* Structured Rooms Table */}
        <div className="border border-slate-300 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-sans font-bold text-sm text-slate-900 uppercase">
              3. Room Instances & Dimensional Bounds (FR-F2-01)
            </h2>
            <button
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
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              ADD ROOM
            </button>
          </div>

          <table className="w-full font-mono text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-left border-b border-slate-200 text-[10px]">
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
              {rooms.map((r, i) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-2 font-bold text-slate-900">{r.id}</td>
                  <td className="p-2 text-sky-700 font-bold uppercase">{r.type}</td>
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
                      onClick={() => setRooms(rooms.filter((item) => item.id !== r.id))}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Adjacency Matrix */}
        <div className="border border-slate-300 bg-white p-5 shadow-xs space-y-3">
          <h2 className="font-sans font-bold text-sm text-slate-900 uppercase">
            4. Spatial Adjacency & Access Constraints (Door / Wall)
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {adjacencies.map((adj, i) => (
              <div
                key={i}
                className="p-2.5 border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">
                    {adj.room_a} ↔ {adj.room_b}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    RELATION: {adj.relation.toUpperCase()} • STRENGTH: {adj.strength.toUpperCase()}
                  </div>
                </div>
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-bold border ${
                    adj.strength === "hard"
                      ? "bg-sky-50 text-sky-800 border-sky-300"
                      : "bg-slate-200 text-slate-700 border-slate-300"
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
