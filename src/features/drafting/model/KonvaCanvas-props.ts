import { DraftingTool,FloorPlan } from "../model/types";

export interface KonvaCanvasProps {
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
