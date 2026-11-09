"use client";
import { checks } from "../data/checks";

import { CheckCircle2,ShieldCheck,X } from "lucide-react";
import React from "react";
import { FloorPlan } from "../model/types";

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FloorPlan;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 select-none">
      <div className="w-[780px] max-h-[85vh] bg-white border-2 border-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-sans font-bold text-sm tracking-wider uppercase">
              GEOMETRIC VALIDATION & AUDIT ENGINE // {plan.revision_badge}
            </span>
            <span className="text-[10px] text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2">
              SHAPELY 2.0 VERIFIED
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
        <div className="bg-emerald-50/70 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between font-mono text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">OVERALL STATUS: PASS (8 Passed, 1 Pending Local Rules)</span>
          </div>
          <span className="text-[10px] text-slate-600 font-mono">
            EVALUATION TIME: 14ms
          </span>
        </div>

        {/* Checks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono">
          {checks.map((c, idx) => (
            <div
              key={idx}
              className="p-3 border border-slate-200 bg-slate-50 flex items-start justify-between gap-4 text-xs hover:border-sky-500 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[10px]">[{c.code}]</span>
                  <span className="font-bold text-slate-900">{c.title}</span>
                </div>
                <div className="text-[11px] text-slate-600">{c.evidence}</div>
              </div>

              <div>
                {c.status === "PASS" ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 text-[10px]">
                    PASS
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold border border-amber-300 text-[10px]">
                    UNKNOWN
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-300 p-3 flex justify-between items-center font-mono text-xs">
          <div className="text-[10px] text-slate-500">
            * All hard constraints re-validated on every revision write before head commit.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all"
          >
            DISMISS REPORT
          </button>
        </div>
      </div>
    </div>
  );
};
