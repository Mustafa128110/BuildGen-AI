export interface RoomRequirement {
  id: string;
  type: string;
  min_width_mm: number;
  max_width_mm: number | null;
  min_area_m2: number;
  max_area_m2: number | null;
}

export interface AdjacencyRequirement {
  room_a: string;
  room_b: string;
  relation: "door" | "wall";
  strength: "hard" | "soft";
}
