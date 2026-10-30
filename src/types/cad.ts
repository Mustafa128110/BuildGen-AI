export type Point = [number, number];

export type RoomType =
  | "living"
  | "bedroom"
  | "kitchen"
  | "bath"
  | "terrace"
  | "dining"
  | "corridor"
  | "stair";

export interface Room {
  id: string;
  requirement_room_id: string;
  type: RoomType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  ring: Point[];
  target_area_m2?: number;
  ceiling_height_mm?: number;
  finish?: string;
  subtext?: string;
  fillColor?: string;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness_mm: number;
}

export interface Opening {
  id: string;
  wall_id: string;
  kind: "door" | "window";
  offset_mm: number;
  width_mm: number;
  sill_mm: number;
  height_mm: number;
  connects: [string, string];
}

export interface CanvasDoor {
  id: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
  label: string;
}

export interface CanvasWindow {
  id: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
  label: string;
}

export interface Plot {
  ring: Point[];
  width: number;
  height: number;
}

export interface FloorPlan {
  project_id: string;
  project_name: string;
  sheet_id: string;
  plan_id: string;
  revision_id: string;
  sequence: number;
  revision_badge: string;
  units: "mm";
  grid_mm: number;
  scale_str: string;
  plot: Plot;
  rooms: Room[];
  walls: Wall[];
  openings: Opening[];
  doors?: CanvasDoor[];
  windows?: CanvasWindow[];
}

export type DraftingTool =
  | "select"
  | "room"
  | "wall"
  | "door"
  | "window"
  | "dimension"
  | "hatch";

export type PenWeight = "0.25mm" | "0.50mm" | "1.00mm";
export type LeadGrade = "2H Fine" | "HB Norm" | "2B Soft";

export interface DraftingDelta {
  delta_id: string;
  title: string;
  description: string;
  gross_area_delta: string;
  bearing_columns_note: string;
  deflection_note: string;
  action_label: string;
  applied?: boolean;
}

export interface CopilotMessage {
  id: string;
  sender: "copilot" | "architect" | "system";
  timestamp: string;
  text: string;
  badge?: string;
  delta?: DraftingDelta;
}

export type ActivePanel = "toolstrip" | "canvas" | "chat";

export interface CanvasSnapshot {
  rooms: Room[];
  doors: CanvasDoor[];
  windows: CanvasWindow[];
}

export interface ToolstripSnapshot {
  activeTool: DraftingTool;
  activePen: PenWeight;
  activeLead: LeadGrade;
  snapEnabled: boolean;
}

export interface ChatSnapshot {
  messages: CopilotMessage[];
}

