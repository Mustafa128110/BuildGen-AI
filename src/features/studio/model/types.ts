export type ViewportMode = "2d" | "3d" | "section" | "sun" | "split";

export type DraftingTool =
  | "select"
  | "pan"
  | "wall-ext"
  | "wall-int"
  | "door-pocket"
  | "glaze-slide"
  | "column"
  | "dimension";

export interface InspectedEntity {
  id: string;
  title: string;
  badge: string;
  level: string;
  area: string;
  structure: string;
  shading: string;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "ai";
  timestamp: string;
  text: string;
  metrics?: {
    span: string;
    solar: string;
    gfa: string;
  };
}

export interface PlacedStamp {
  id: string;
  type: DraftingTool;
  x: number;
  y: number;
  label: string;
}
