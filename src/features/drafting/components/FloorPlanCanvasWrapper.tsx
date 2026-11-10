"use client";
import { useHydrated } from "@/shared/hooks/use-hydrated";

import dynamic from "next/dynamic";
import React from "react";
import { DraftingTool,FloorPlan } from "../model/types";

const KonvaCanvas = dynamic(
  () => import("./KonvaCanvas").then((mod) => mod.KonvaCanvas),
  {
    ssr: false,
    loading: () => (
      <section className="flex-1 flex flex-col items-center justify-center bg-slate-100 blueprint-grid-canvas font-mono text-xs text-slate-500">
        <div className="p-4 bg-white border border-slate-300 shadow-md flex items-center gap-2">
          <div className="w-3 h-3 bg-sky-600 rounded-full animate-ping"></div>
          <span>INITIALIZING DRAFTING ENGINE (KONVA.JS)...</span>
        </div>
      </section>
    ),
  }
);

interface FloorPlanCanvasWrapperProps {
  plan: FloorPlan;
  onUpdatePlan: (updatedPlan: FloorPlan, recordHistory?: boolean) => void;
  activeTool: DraftingTool;
  onSelectTool: (tool: DraftingTool) => void;
  selectedRoomIds: string[];
  onSelectRooms: (roomIds: string[]) => void;
  onUpdateCoordinates?: (xMeters: number, yMeters: number) => void;
  snapEnabled: boolean;
  onToggleSnap: () => void;
  isActivePanel?: boolean;
  onMouseEnter?: () => void;
  onUndoCanvas?: () => void;
  canUndoCanvas?: boolean;
  onRedoCanvas?: () => void;
  canRedoCanvas?: boolean;
}

export const FloorPlanCanvasWrapper: React.FC<FloorPlanCanvasWrapperProps> = (
  props
) => {
  const mounted = useHydrated();

  if (!mounted) {
    return (
      <section className="flex-1 flex flex-col items-center justify-center bg-slate-100 blueprint-grid-canvas font-mono text-xs text-slate-500">
        <div className="p-4 bg-white border border-slate-300 shadow-md flex items-center gap-2">
          <div className="w-3 h-3 bg-sky-600 rounded-full animate-ping"></div>
          <span>LOADING CANVAS...</span>
        </div>
      </section>
    );
  }

  return <KonvaCanvas {...props} />;
};
