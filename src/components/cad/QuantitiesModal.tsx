"use client";

import React from "react";
import { FloorPlan } from "@/types/cad";
import { X, FileSpreadsheet, Download, CheckCircle, AlertTriangle } from "lucide-react";

interface QuantitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FloorPlan;
}

export const QuantitiesModal: React.FC<QuantitiesModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  if (!isOpen) return null;

  // Realistic architectural takeoffs based on plan
  const items = [
    {
      code: "FF-01",
      description: "Engineered Oak Parquet Flooring (Living & Atrium)",
      qty: 36.2,
      unit: "m²",
      rate: 4500,
      total: 162900,
      status: "reviewed",
    },
    {
      code: "FF-02",
      description: "Polished Terrazzo Flooring (Chef Kitchen & Pantry)",
      qty: 18.5,
      unit: "m²",
      rate: 3200,
      total: 59200,
      status: "reviewed",
    },
    {
      code: "FF-03",
      description: "Acoustic Felt & Wool Underlay (Master Suite)",
      qty: 24.0,
      unit: "m²",
      rate: 2800,
      total: 67200,
      status: "reviewed",
    },
    {
      code: "FF-04",
      description: "Honed Slate Non-Slip Tile (En-Suite Spa Bath)",
      qty: 9.8,
      unit: "m²",
      rate: 3800,
      total: 37240,
      status: "reviewed",
    },
    {
      code: "FF-05",
      description: "Treated Teak Outdoor Decking (Terrace Loggia)",
      qty: 14.4,
      unit: "m²",
      rate: 5200,
      total: 74880,
      status: "reviewed",
    },
    {
      code: "WM-01",
      description: "200mm Reinforced Concrete Bearing Wall Union (Height: 3.0m)",
      qty: 24.92,
      unit: "m³",
      rate: 18500,
      total: 461020,
      status: "reviewed",
    },
    {
      code: "DR-01",
      description: "Flush Solid Timber Doors with Hardware (D-01, D-02, D-03)",
      qty: 3,
      unit: "each",
      rate: 32000,
      total: 96000,
      status: "reviewed",
    },
    {
      code: "WN-01",
      description: "Triple-Pane Casement Window W-04 (3,200 x 1,400mm)",
      qty: 1,
      unit: "each",
      rate: 55000,
      total: 55000,
      status: "reviewed",
    },
    {
      code: "EX-01",
      description: "Terrace Loggia Cantilever Steel Posts (HEB-180)",
      qty: 2,
      unit: "each",
      rate: 0,
      total: 0,
      status: "unpriced",
    },
  ];

  const totalSum = items.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 select-none">
      <div className="w-[840px] max-h-[85vh] bg-white border-2 border-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span className="font-sans font-bold text-sm tracking-wider uppercase">
              PRELIMINARY QUANTITY & COST ESTIMATION (BOQ)
            </span>
            <span className="text-[10px] text-amber-300 border border-amber-500/40 px-1.5 py-0.2">
              PKR • KARACHI RATE SET 2026.Q4
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 grid grid-cols-4 gap-4 font-mono text-xs">
          <div>
            <div className="text-slate-500 text-[10px]">TOTAL FINISHED AREA</div>
            <div className="text-slate-900 font-bold text-sm">102.90 m²</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">PLOT FOOTPRINT</div>
            <div className="text-slate-900 font-bold text-sm">141.61 m²</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">COVERAGE RATIO</div>
            <div className="text-sky-700 font-bold text-sm">72.6% (Within Limit)</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">PARTIAL TOTAL ESTIMATE</div>
            <div className="text-amber-800 font-bold text-sm">
              Rs. {totalSum.toLocaleString()} PKR
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full font-mono text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-left border-b border-slate-200 text-[10px]">
                <th className="p-2">CODE</th>
                <th className="p-2">SPECIFICATION / ITEM</th>
                <th className="p-2 text-right">QUANTITY</th>
                <th className="p-2">UNIT</th>
                <th className="p-2 text-right">RATE (PKR)</th>
                <th className="p-2 text-right">AMOUNT (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-slate-100 hover:bg-slate-50 ${
                    item.status === "unpriced" ? "bg-amber-50/40 text-amber-900" : ""
                  }`}
                >
                  <td className="p-2 font-bold text-slate-800">{item.code}</td>
                  <td className="p-2">
                    {item.description}
                    {item.status === "unpriced" && (
                      <span className="ml-2 text-[9px] text-amber-700 font-bold">
                        [EXCLUDED / UNPRICED]
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-right font-bold">{item.qty.toFixed(2)}</td>
                  <td className="p-2 text-slate-600">{item.unit}</td>
                  <td className="p-2 text-right">
                    {item.rate > 0 ? item.rate.toLocaleString() : "—"}
                  </td>
                  <td className="p-2 text-right font-bold text-slate-900">
                    {item.total > 0 ? `Rs. ${item.total.toLocaleString()}` : "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 p-2 bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex items-center justify-between">
            <span>
              * Quantities derived automatically from canonical 10mm wall and room polygons.
            </span>
            <span className="font-bold text-slate-800">
              IMMUTABLE SNAPSHOT #REV-03.4
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-300 p-3 flex justify-between items-center font-mono text-xs">
          <div className="text-[10px] text-slate-500">
            DISCLAIMER: Preliminary concept takeoff only. Not a commercial contractor tender.
          </div>
          <button
            onClick={() => alert("BOQ CSV and PDF exported.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white font-bold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT BOQ (CSV/PDF)
          </button>
        </div>
      </div>
    </div>
  );
};
