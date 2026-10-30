"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Stage, 
  Layer, 
  Rect, 
  Text, 
  Line, 
  Group, 
  Arc, 
  Transformer 
} from "react-konva";
import Konva from "konva";
import { FloorPlan, Room, CanvasDoor, CanvasWindow, DraftingTool } from "@/types/cad";
import { 
  MousePointer, 
  Square, 
  DoorClosed, 
  Grid2X2, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Grid,
  FilePlus2,
  Undo2,
  Redo2,
  Layers
} from "lucide-react";

interface KonvaCanvasProps {
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

export const KonvaCanvas: React.FC<KonvaCanvasProps> = ({
  plan,
  onUpdatePlan,
  activeTool,
  onSelectTool,
  selectedRoomIds,
  onSelectRooms,
  onUpdateCoordinates,
  snapEnabled,
  onToggleSnap,
  isActivePanel = false,
  onMouseEnter,
  onUndoCanvas,
  canUndoCanvas = false,
  onRedoCanvas,
  canRedoCanvas = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Responsive stage dimensions
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [newRect, setNewRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Plot configuration (14.45m x 9.80m = 722px x 490px at 50px/meter)
  const PLOT_WIDTH = 740;
  const PLOT_HEIGHT = 490;

  // Compute center offset dynamically to keep the floor plan in the center of the canvas
  const centerOffsetX = Math.max(30, Math.floor((dimensions.width - PLOT_WIDTH) / 2));
  const centerOffsetY = Math.max(40, Math.floor((dimensions.height - PLOT_HEIGHT) / 2));

  // Responsive container observer for pixel-accurate centering
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setDimensions({
            width: Math.floor(entry.contentRect.width),
            height: Math.floor(entry.contentRect.height),
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Snap utility
  const snap = (val: number, gridSize = 10) => {
    if (!snapEnabled) return val;
    return Math.round(val / gridSize) * gridSize;
  };

  // Convert canvas pixel to real-world meters (50px = 1.0m)
  const pxToMeters = (px: number) => (px / 50).toFixed(2);
  const calculateAreaM2 = (wPx: number, hPx: number) => {
    const w = wPx / 50;
    const h = hPx / 50;
    return (w * h).toFixed(1);
  };

  // Attach transformer to all selected rooms
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    const transformer = transformerRef.current;

    if (selectedRoomIds.length > 0) {
      const nodes = selectedRoomIds
        .map((id) => stageRef.current?.findOne(`#${id}`))
        .filter(Boolean) as Konva.Node[];

      transformer.nodes(nodes);
      transformer.getLayer()?.batchDraw();
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedRoomIds, plan.rooms]);

  // Handle stage mouse move for coordinate ticker & drawing
  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Transform pointer to plot-centered coordinate space
    const stageX = (pointer.x - position.x) / scale - centerOffsetX;
    const stageY = (pointer.y - position.y) / scale - centerOffsetY;

    if (onUpdateCoordinates) {
      onUpdateCoordinates(
        Math.max(0, Number(pxToMeters(stageX))),
        Math.max(0, Number(pxToMeters(stageY)))
      );
    }

    // If currently drawing a new room
    if (isDrawing && newRect) {
      const currentX = snap(stageX);
      const currentY = snap(stageY);
      setNewRect({
        ...newRect,
        width: currentX - newRect.x,
        height: currentY - newRect.y,
      });
    }
  };

  // Handle stage mouse down for drawing or selection
  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    // If clicked on empty stage / background, deselect unless multi-select key pressed
    if (e.target === stage || e.target.name() === "plot-background") {
      if (!e.evt.ctrlKey && !e.evt.metaKey && !e.evt.shiftKey) {
        onSelectRooms([]);
      }
    }

    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const stageX = snap((pointer.x - position.x) / scale - centerOffsetX);
    const stageY = snap((pointer.y - position.y) / scale - centerOffsetY);

    // If in room drawing mode
    if (activeTool === "room") {
      setIsDrawing(true);
      setNewRect({ x: stageX, y: stageY, width: 0, height: 0 });
    } else if (activeTool === "door") {
      const newDoor: CanvasDoor = {
        id: `d_${Date.now()}`,
        x: stageX,
        y: stageY,
        width: 45,
        rotation: 0,
        label: `D-0${(plan.doors?.length || 0) + 1}`,
      };
      onUpdatePlan({
        ...plan,
        doors: [...(plan.doors || []), newDoor],
      });
      onSelectTool("select");
    } else if (activeTool === "window") {
      const newWin: CanvasWindow = {
        id: `w_${Date.now()}`,
        x: stageX,
        y: stageY,
        width: 100,
        rotation: 0,
        label: `W-0${(plan.windows?.length || 0) + 1}`,
      };
      onUpdatePlan({
        ...plan,
        windows: [...(plan.windows || []), newWin],
      });
      onSelectTool("select");
    }
  };

  // Handle stage mouse up to finish drawing
  const handleStageMouseUp = () => {
    if (!isDrawing || !newRect) return;
    setIsDrawing(false);

    let rx = newRect.x;
    let ry = newRect.y;
    let rw = newRect.width;
    let rh = newRect.height;

    if (rw < 0) {
      rx += rw;
      rw = Math.abs(rw);
    }
    if (rh < 0) {
      ry += rh;
      rh = Math.abs(rh);
    }

    if (rw >= 40 && rh >= 40) {
      const newRoomId = `r_${Date.now()}`;
      const newRoom: Room = {
        id: newRoomId,
        requirement_room_id: `need_${Date.now()}`,
        type: "bedroom",
        label: `ROOM ${(plan.rooms.length + 1).toString().padStart(2, "0")}`,
        x: rx,
        y: ry,
        width: rw,
        height: rh,
        target_area_m2: Number(calculateAreaM2(rw, rh)),
        finish: "Custom Finish",
        fillColor: "rgba(2, 132, 199, 0.08)",
        ring: [
          [rx, ry],
          [rx + rw, ry],
          [rx + rw, ry + rh],
          [rx, ry + rh],
          [rx, ry],
        ],
      };

      onUpdatePlan({
        ...plan,
        rooms: [...plan.rooms, newRoom],
      });

      onSelectRooms([newRoomId]);
      onSelectTool("select");
    }

    setNewRect(null);
  };

  // Handle clicking a room (support single select or Ctrl+Select multi-select)
  const handleRoomClick = (roomId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool !== "select") return;
    e.cancelBubble = true;

    const isMultiKey = e.evt.ctrlKey || e.evt.metaKey || e.evt.shiftKey;

    if (isMultiKey) {
      if (selectedRoomIds.includes(roomId)) {
        onSelectRooms(selectedRoomIds.filter((id) => id !== roomId));
      } else {
        onSelectRooms([...selectedRoomIds, roomId]);
      }
    } else {
      onSelectRooms([roomId]);
    }
  };

  // Handle Room Drag End
  const handleRoomDragEnd = (roomId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const nx = snap(node.x());
    const ny = snap(node.y());

    node.position({ x: nx, y: ny });

    const updatedRooms = plan.rooms.map((r) => {
      if (r.id === roomId) {
        return {
          ...r,
          x: nx,
          y: ny,
          ring: [
            [nx, ny],
            [nx + r.width, ny],
            [nx + r.width, ny + r.height],
            [nx, ny + r.height],
            [nx, ny],
          ] as [number, number][],
        };
      }
      return r;
    });

    onUpdatePlan({
      ...plan,
      rooms: updatedRooms,
    });
  };

  // Handle Room Transform End (Resizing)
  const handleRoomTransformEnd = (roomId: string, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target as Konva.Rect;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const nx = snap(node.x());
    const ny = snap(node.y());
    const nw = Math.max(40, snap(node.width() * scaleX));
    const nh = Math.max(40, snap(node.height() * scaleY));

    node.position({ x: nx, y: ny });
    node.width(nw);
    node.height(nh);

    const updatedRooms = plan.rooms.map((r) => {
      if (r.id === roomId) {
        return {
          ...r,
          x: nx,
          y: ny,
          width: nw,
          height: nh,
          target_area_m2: Number(calculateAreaM2(nw, nh)),
          ring: [
            [nx, ny],
            [nx + nw, ny],
            [nx + nw, ny + nh],
            [nx, ny + nh],
            [nx, ny],
          ] as [number, number][],
        };
      }
      return r;
    });

    onUpdatePlan({
      ...plan,
      rooms: updatedRooms,
    });
  };

  // Delete all selected rooms
  const handleDeleteSelected = useCallback(() => {
    if (selectedRoomIds.length === 0) return;
    onUpdatePlan({
      ...plan,
      rooms: plan.rooms.filter((r) => !selectedRoomIds.includes(r.id)),
    });
    onSelectRooms([]);
  }, [selectedRoomIds, plan, onUpdatePlan, onSelectRooms]);

  // Keyboard Shortcuts: Delete, Select All, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Delete selected
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedRoomIds.length > 0) {
          e.preventDefault();
          handleDeleteSelected();
        }
      }

      // Escape to deselect
      if (e.key === "Escape") {
        onSelectRooms([]);
        setIsDrawing(false);
        setNewRect(null);
        onSelectTool("select");
      }

      // Ctrl+A / Cmd+A to select all rooms if hovered on canvas
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a" && isActivePanel) {
        e.preventDefault();
        onSelectRooms(plan.rooms.map((r) => r.id));
      }

      // Single key tool shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key.toLowerCase() === "v") onSelectTool("select");
        else if (e.key.toLowerCase() === "r") onSelectTool("room");
        else if (e.key.toLowerCase() === "d") onSelectTool("door");
        else if (e.key.toLowerCase() === "o") onSelectTool("window");
        else if (e.key.toLowerCase() === "s") onToggleSnap();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDeleteSelected, selectedRoomIds, plan.rooms, onSelectRooms, onSelectTool, onToggleSnap, isActivePanel]);

  // Clear canvas / Start scratch
  const handleClearCanvas = () => {
    if (confirm("Clear floor plan to start drafting from scratch?")) {
      onUpdatePlan({
        ...plan,
        rooms: [],
        doors: [],
        windows: [],
      });
      onSelectRooms([]);
    }
  };

  // Zoom handlers
  const handleZoom = (direction: "in" | "out" | "reset") => {
    if (direction === "in") setScale((s) => Math.min(2.5, s + 0.15));
    else if (direction === "out") setScale((s) => Math.max(0.5, s - 0.15));
    else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  return (
    <section 
      onMouseEnter={onMouseEnter}
      className={`flex-1 flex flex-col relative overflow-hidden bg-slate-100 select-none transition-colors ${
        isActivePanel ? "ring-1 ring-inset ring-sky-500/30" : ""
      }`}
    >
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
        </div>
      </div>

      <div className="flex-1 flex relative overflow-hidden" ref={containerRef}>
        {/* Left Technical Ruler */}
        <div className="w-6 bg-slate-50 border-r border-slate-300 h-full ruler-left-ticks flex flex-col justify-between py-4 font-mono text-[10px] text-slate-500 shrink-0 items-center">
          <span>0.0</span>
          <span>2.0</span>
          <span>4.0</span>
          <span>6.0</span>
          <span>8.0</span>
          <span>10.0</span>
        </div>

        {/* Floating Drafting Canvas Controls */}
        <div className="absolute top-3 left-10 z-30 flex items-center gap-1.5 p-1 bg-white/95 border border-slate-300 shadow-md backdrop-blur-xs font-mono text-xs">
          {/* Panel Identity Badge */}
          <div className="px-2 py-0.5 border-r border-slate-200 flex items-center gap-1.5 font-sans font-bold text-[10px] text-slate-800">
            <span className={`w-2 h-2 rounded-full ${isActivePanel ? "bg-sky-600 animate-pulse" : "bg-slate-300"}`}></span>
            <span>CANVAS</span>
          </div>

          {/* Undo / Redo Buttons for Canvas */}
          {onUndoCanvas && (
            <button
              onClick={onUndoCanvas}
              disabled={!canUndoCanvas}
              className={`px-1.5 py-1 flex items-center gap-1 border transition-colors ${
                canUndoCanvas 
                  ? "border-slate-300 hover:bg-slate-100 text-slate-700" 
                  : "border-slate-200 text-slate-300 cursor-not-allowed"
              }`}
              title="Undo Canvas Change [Ctrl+Z]"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}

          {onRedoCanvas && (
            <button
              onClick={onRedoCanvas}
              disabled={!canRedoCanvas}
              className={`px-1.5 py-1 flex items-center gap-1 border transition-colors ${
                canRedoCanvas 
                  ? "border-slate-300 hover:bg-slate-100 text-slate-700" 
                  : "border-slate-200 text-slate-300 cursor-not-allowed"
              }`}
              title="Redo Canvas Change [Ctrl+Y]"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Redo</span>
            </button>
          )}

          <div className="w-[1px] h-5 bg-slate-300 mx-0.5"></div>

          {/* Select Tool */}
          <button
            onClick={() => onSelectTool("select")}
            className={`px-2 py-1 flex items-center gap-1 border transition-colors ${
              activeTool === "select"
                ? "bg-sky-50 text-sky-800 border-sky-600 font-bold"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
            title="Select & Transform [V] (Ctrl+Click for multi-select)"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Select [V]</span>
          </button>

          {/* Draw Room Tool */}
          <button
            onClick={() => onSelectTool("room")}
            className={`px-2 py-1 flex items-center gap-1 border transition-colors ${
              activeTool === "room"
                ? "bg-sky-50 text-sky-800 border-sky-600 font-bold"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
            title="Draw Room Rectangle [R]"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Draw Room [R]</span>
          </button>

          {/* Door Tool */}
          <button
            onClick={() => onSelectTool("door")}
            className={`px-2 py-1 flex items-center gap-1 border transition-colors ${
              activeTool === "door"
                ? "bg-sky-50 text-sky-800 border-sky-600 font-bold"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
            title="Place Door [D]"
          >
            <DoorClosed className="w-3.5 h-3.5" />
            <span>Door [D]</span>
          </button>

          {/* Window Tool */}
          <button
            onClick={() => onSelectTool("window")}
            className={`px-2 py-1 flex items-center gap-1 border transition-colors ${
              activeTool === "window"
                ? "bg-sky-50 text-sky-800 border-sky-600 font-bold"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
            title="Place Window [O]"
          >
            <Grid2X2 className="w-3.5 h-3.5" />
            <span>Window [O]</span>
          </button>

          <div className="w-[1px] h-5 bg-slate-300 mx-0.5"></div>

          {/* Delete Selected Room(s) */}
          {selectedRoomIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 flex items-center gap-1 font-bold transition-colors"
              title="Delete Selected Rooms [Del]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedRoomIds.length})</span>
            </button>
          )}

          {/* Clear Canvas */}
          <button
            onClick={handleClearCanvas}
            className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1 transition-colors"
            title="Start New Floor Plan from Scratch"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <div className="w-[1px] h-5 bg-slate-300 mx-0.5"></div>

          {/* Snap toggle */}
          <button
            onClick={onToggleSnap}
            className={`p-1 border transition-colors ${
              snapEnabled
                ? "bg-sky-50 border-sky-500 text-sky-700 font-bold"
                : "border-slate-300 text-slate-400"
            }`}
            title="Snap to 10mm Grid [S]"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Zoom controls */}
          <button
            onClick={() => handleZoom("in")}
            className="p-1 border border-slate-300 text-slate-600 hover:bg-slate-50"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom("out")}
            className="p-1 border border-slate-300 text-slate-600 hover:bg-slate-50"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom("reset")}
            className="p-1 border border-slate-300 text-slate-600 hover:bg-slate-50"
            title="Reset View [100%]"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* The Konva Canvas Blueprint Container */}
        <div className="flex-1 h-full blueprint-grid-canvas relative overflow-hidden cursor-crosshair">
          <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            onMouseMove={handleStageMouseMove}
            onMouseDown={handleStageMouseDown}
            onMouseUp={handleStageMouseUp}
          >
            <Layer>
              {/* Centered Plot Group: Keeps floorplan precisely in the center of the canvas */}
              <Group x={centerOffsetX} y={centerOffsetY}>
                {/* Outer Plot Boundary Background */}
                <Rect
                  name="plot-background"
                  x={0}
                  y={0}
                  width={PLOT_WIDTH}
                  height={PLOT_HEIGHT}
                  stroke="#64748b"
                  strokeWidth={1.5}
                  dash={[6, 4]}
                  fill="rgba(255, 255, 255, 0.5)"
                />

                {/* ============================================================ */}
                {/* TOP OVERALL DIMENSION LINE (Strictly along X-axis at Y=-18) */}
                {/* ============================================================ */}
                <Group>
                  {/* Dimension line parallel to X axis */}
                  <Line points={[0, -18, PLOT_WIDTH, -18]} stroke="#0369a1" strokeWidth={1.5} />
                  
                  {/* Vertical Perpendicular Witness Lines */}
                  <Line points={[0, 0, 0, -24]} stroke="#0369a1" strokeWidth={1} />
                  <Line points={[PLOT_WIDTH, 0, PLOT_WIDTH, -24]} stroke="#0369a1" strokeWidth={1} />
                  
                  {/* Axis-Aligned Inward Arrowheads */}
                  <Line points={[8, -21, 0, -18, 8, -15]} stroke="#0369a1" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                  <Line points={[PLOT_WIDTH - 8, -21, PLOT_WIDTH, -18, PLOT_WIDTH - 8, -15]} stroke="#0369a1" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                  
                  {/* 45° Architectural Slash Ticks */}
                  <Line points={[-4, -14, 4, -22]} stroke="#0369a1" strokeWidth={2} />
                  <Line points={[PLOT_WIDTH - 4, -14, PLOT_WIDTH + 4, -22]} stroke="#0369a1" strokeWidth={2} />
                  
                  {/* Centered Dimension Text */}
                  <Text
                    x={PLOT_WIDTH / 2 - 80}
                    y={-34}
                    width={160}
                    align="center"
                    text="14,450 mm [TOTAL SPAN]"
                    fill="#0369a1"
                    fontSize={10}
                    fontFamily="Space Mono"
                    fontStyle="bold"
                  />
                </Group>

                {/* ============================================================ */}
                {/* LEFT OVERALL DIMENSION LINE (Strictly along Y-axis at X=-18) */}
                {/* ============================================================ */}
                <Group>
                  {/* Dimension line parallel to Y axis */}
                  <Line points={[-18, 0, -18, PLOT_HEIGHT]} stroke="#0369a1" strokeWidth={1.5} />
                  
                  {/* Horizontal Perpendicular Witness Lines */}
                  <Line points={[0, 0, -24, 0]} stroke="#0369a1" strokeWidth={1} />
                  <Line points={[0, PLOT_HEIGHT, -24, PLOT_HEIGHT]} stroke="#0369a1" strokeWidth={1} />
                  
                  {/* Axis-Aligned Inward Arrowheads */}
                  <Line points={[-21, 8, -18, 0, -15, 8]} stroke="#0369a1" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                  <Line points={[-21, PLOT_HEIGHT - 8, -18, PLOT_HEIGHT, -15, PLOT_HEIGHT - 8]} stroke="#0369a1" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                  
                  {/* 45° Architectural Slash Ticks */}
                  <Line points={[-22, 4, -14, -4]} stroke="#0369a1" strokeWidth={2} />
                  <Line points={[-22, PLOT_HEIGHT + 4, -14, PLOT_HEIGHT - 4]} stroke="#0369a1" strokeWidth={2} />
                  
                  {/* Rotated Centered Dimension Text */}
                  <Text
                    x={-34}
                    y={PLOT_HEIGHT / 2 + 35}
                    rotation={-90}
                    text="9,800 mm"
                    fill="#0369a1"
                    fontSize={10}
                    fontFamily="Space Mono"
                    fontStyle="bold"
                  />
                </Group>

                {/* ============================================================ */}
                {/* ROOMS LAYER */}
                {/* ============================================================ */}
                {plan.rooms.map((room) => {
                  const isSelected = selectedRoomIds.includes(room.id);
                  const areaStr = `${calculateAreaM2(room.width, room.height)} m²`;
                  const dimStr = `${pxToMeters(room.width)}m × ${pxToMeters(room.height)}m`;

                  return (
                    <Group
                      key={room.id}
                      id={room.id}
                      x={room.x}
                      y={room.y}
                      draggable={activeTool === "select"}
                      onClick={(e) => handleRoomClick(room.id, e)}
                      onDragEnd={(e) => handleRoomDragEnd(room.id, e)}
                      onTransformEnd={(e) => handleRoomTransformEnd(room.id, e)}
                    >
                      {/* Room Floor Rectangle */}
                      <Rect
                        width={room.width}
                        height={room.height}
                        fill={room.fillColor || "rgba(2, 132, 199, 0.08)"}
                        stroke={isSelected ? "#0284c7" : "#0f172a"}
                        strokeWidth={isSelected ? 2.5 : 2}
                        shadowColor={isSelected ? "#0284c7" : "transparent"}
                        shadowBlur={isSelected ? 8 : 0}
                        shadowOpacity={0.3}
                      />

                      {/* Clean Room Title & Area Label */}
                      <Text
                        x={8}
                        y={room.height / 2 - 14}
                        width={room.width - 16}
                        align="center"
                        text={room.label}
                        fill="#0f172a"
                        fontSize={11}
                        fontFamily="Space Grotesk"
                        fontStyle="bold"
                      />

                      <Text
                        x={8}
                        y={room.height / 2 + 2}
                        width={room.width - 16}
                        align="center"
                        text={`${areaStr} • [${dimStr}]`}
                        fill="#0369a1"
                        fontSize={10}
                        fontFamily="Space Mono"
                        fontStyle="bold"
                      />

                      {/* Room-Level Dimension Lines when Selected (Strictly Axis-Aligned) */}
                      {isSelected && (
                        <Group>
                          {/* Top edge dimension line */}
                          <Line
                            points={[0, -8, room.width, -8]}
                            stroke="#0284c7"
                            strokeWidth={1.5}
                          />
                          {/* Top edge witness lines */}
                          <Line points={[0, -12, 0, -4]} stroke="#0284c7" strokeWidth={1} />
                          <Line points={[room.width, -12, room.width, -4]} stroke="#0284c7" strokeWidth={1} />
                          {/* Top edge inward arrowheads */}
                          <Line points={[6, -11, 0, -8, 6, -5]} stroke="#0284c7" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                          <Line points={[room.width - 6, -11, room.width, -8, room.width - 6, -5]} stroke="#0284c7" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                          {/* Top edge 45° slash ticks */}
                          <Line points={[-3, -5, 3, -11]} stroke="#0284c7" strokeWidth={2} />
                          <Line points={[room.width - 3, -5, room.width + 3, -11]} stroke="#0284c7" strokeWidth={2} />
                          {/* Top edge text */}
                          <Text
                            x={room.width / 2 - 40}
                            y={-22}
                            width={80}
                            align="center"
                            text={`${pxToMeters(room.width)}m`}
                            fill="#0284c7"
                            fontSize={9}
                            fontFamily="Space Mono"
                            fontStyle="bold"
                          />

                          {/* Left edge dimension line */}
                          <Line
                            points={[-8, 0, -8, room.height]}
                            stroke="#0284c7"
                            strokeWidth={1.5}
                          />
                          {/* Left edge witness lines */}
                          <Line points={[-12, 0, -4, 0]} stroke="#0284c7" strokeWidth={1} />
                          <Line points={[-12, room.height, -4, room.height]} stroke="#0284c7" strokeWidth={1} />
                          {/* Left edge inward arrowheads */}
                          <Line points={[-11, 6, -8, 0, -5, 6]} stroke="#0284c7" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                          <Line points={[-11, room.height - 6, -8, room.height, -5, room.height - 6]} stroke="#0284c7" strokeWidth={1.5} lineCap="round" lineJoin="round" />
                          {/* Left edge 45° slash ticks */}
                          <Line points={[-11, 3, -5, -3]} stroke="#0284c7" strokeWidth={2} />
                          <Line points={[-11, room.height + 3, -5, room.height - 3]} stroke="#0284c7" strokeWidth={2} />
                          {/* Left edge text */}
                          <Text
                            x={-38}
                            y={room.height / 2 - 5}
                            width={28}
                            align="right"
                            text={`${pxToMeters(room.height)}m`}
                            fill="#0284c7"
                            fontSize={9}
                            fontFamily="Space Mono"
                            fontStyle="bold"
                          />
                        </Group>
                      )}
                    </Group>
                  );
                })}

                {/* ============================================================ */}
                {/* DOORS LAYER */}
                {/* ============================================================ */}
                {plan.doors?.map((door) => (
                  <Group key={door.id} x={door.x} y={door.y} rotation={door.rotation}>
                    <Line points={[0, 0, door.width, 0]} stroke="#0284c7" strokeWidth={2} />
                    <Arc
                      x={0}
                      y={0}
                      innerRadius={door.width - 1}
                      outerRadius={door.width}
                      angle={90}
                      stroke="#0284c7"
                      strokeWidth={1}
                      dash={[4, 3]}
                    />
                    <Text
                      x={door.width / 2}
                      y={10}
                      text={door.label}
                      fill="#0369a1"
                      fontSize={8}
                      fontFamily="Space Mono"
                      fontStyle="bold"
                    />
                  </Group>
                ))}

                {/* ============================================================ */}
                {/* WINDOWS LAYER */}
                {/* ============================================================ */}
                {plan.windows?.map((win) => (
                  <Group key={win.id} x={win.x} y={win.y} rotation={win.rotation}>
                    <Rect
                      x={0}
                      y={-4}
                      width={win.width}
                      height={8}
                      fill="#f0f9ff"
                      stroke="#0f172a"
                      strokeWidth={1.5}
                    />
                    <Line
                      points={[win.width * 0.33, -4, win.width * 0.33, 4]}
                      stroke="#0284c7"
                      strokeWidth={1.5}
                    />
                    <Line
                      points={[win.width * 0.66, -4, win.width * 0.66, 4]}
                      stroke="#0284c7"
                      strokeWidth={1.5}
                    />
                    <Text
                      x={win.width / 2 - 25}
                      y={-14}
                      width={50}
                      align="center"
                      text={win.label}
                      fill="#0f172a"
                      fontSize={8}
                      fontFamily="Space Mono"
                    />
                  </Group>
                ))}

                {/* ============================================================ */}
                {/* NEW ROOM DRAWING PREVIEW */}
                {/* ============================================================ */}
                {isDrawing && newRect && (
                  <Group>
                    <Rect
                      x={newRect.x}
                      y={newRect.y}
                      width={newRect.width}
                      height={newRect.height}
                      fill="rgba(2, 132, 199, 0.15)"
                      stroke="#0284c7"
                      strokeWidth={2}
                      dash={[4, 4]}
                    />
                    <Text
                      x={newRect.x + 8}
                      y={newRect.y + 8}
                      text={`${pxToMeters(Math.abs(newRect.width))}m × ${pxToMeters(Math.abs(newRect.height))}m`}
                      fill="#0284c7"
                      fontSize={10}
                      fontFamily="Space Mono"
                      fontStyle="bold"
                    />
                  </Group>
                )}
              </Group>

              {/* ============================================================ */}
              {/* TRANSFORMER FOR RESIZING & ROTATION */}
              {/* ============================================================ */}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 40 || newBox.height < 40) {
                    return oldBox;
                  }
                  return newBox;
                }}
                rotateEnabled={false}
                enabledAnchors={[
                  "top-left",
                  "top-center",
                  "top-right",
                  "middle-right",
                  "middle-left",
                  "bottom-left",
                  "bottom-center",
                  "bottom-right",
                ]}
                anchorFill="#0284c7"
                anchorStroke="#ffffff"
                anchorSize={8}
                borderStroke="#0284c7"
                borderDash={[3, 3]}
              />
            </Layer>
          </Stage>

          {/* Bottom Floating Status Bar */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/95 border border-slate-300 flex items-center gap-4 font-mono text-[10px] text-slate-700 shadow-md backdrop-blur-xs">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isActivePanel ? "bg-sky-600 animate-pulse" : "bg-slate-400"}`}></span>
              CANVAS: {isActivePanel ? "ACTIVE [Ctrl+Z to Undo]" : "HOVER TO FOCUS"}
            </span>
            <span className="text-slate-300">|</span>
            <span>
              TOOL: {activeTool.toUpperCase()}
            </span>
            <span className="text-slate-300">|</span>
            <span>
              ROOMS: {plan.rooms.length} | DOORS: {plan.doors?.length || 0}
            </span>
            <span className="text-slate-300">|</span>
            <span>
              {selectedRoomIds.length > 0
                ? `${selectedRoomIds.length} ROOM(S) SELECTED (Ctrl+Click to toggle, Del to remove)`
                : "CLICK TO SELECT (Ctrl+Click for multiple)"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
