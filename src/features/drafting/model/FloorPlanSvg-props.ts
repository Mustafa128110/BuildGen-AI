import { DraftingTool,FloorPlan } from "../model/types";

export interface FloorPlanSvgProps {
  plan: FloorPlan;
  activeTool: DraftingTool;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
  onUpdateCoordinates?: (xMeters: number, yMeters: number) => void;
  showFurnLayer?: boolean;
  showHvacLayer?: boolean;
  showDimsLayer?: boolean;
}
