"use client";
import Konva from "konva";
import { useCallback,useEffect,useRef,useState } from "react";
import type { KonvaCanvasProps } from "../model/KonvaCanvas-props";
import { calculateAreaM2,pxToMeters,snapToGrid } from "../model/geometry";
import { CanvasDoor,CanvasWindow,Room } from "../model/types";

export function useKonvaCanvas({
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
}: KonvaCanvasProps) {
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

  const snap = (value: number, gridSize = 10) => snapToGrid(value, snapEnabled, gridSize);

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
  return { containerRef, stageRef, transformerRef, dimensions, scale, position, isDrawing, newRect, PLOT_WIDTH, PLOT_HEIGHT, centerOffsetX, centerOffsetY, handleStageMouseMove, handleStageMouseDown, handleStageMouseUp, handleRoomClick, handleRoomDragEnd, handleRoomTransformEnd, handleDeleteSelected, handleClearCanvas, handleZoom, plan, activeTool, onSelectTool, selectedRoomIds, snapEnabled, onToggleSnap, isActivePanel, onMouseEnter, onUndoCanvas, canUndoCanvas, onRedoCanvas, canRedoCanvas };
}
