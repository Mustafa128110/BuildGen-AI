import type { AdjacencyRequirement,RoomRequirement } from "./types";
export interface RequirementsDraft { briefText: string; plotWidth: number; plotDepth: number; rooms: RoomRequirement[]; adjacencies: AdjacencyRequirement[] }

export function createRequirementsDraft(): RequirementsDraft {
 return { briefText: "A 240 sq.yd single-storey concept with a spacious living atrium, master bedroom suite with ensuite bath, modern chef kitchen with pantry island, and an outdoor terrace loggia.",
plotWidth: 14450,
plotDepth: 9800,
rooms: [
    {
      id: "need_living",
      type: "living",
      min_width_mm: 4500,
      max_width_mm: 8000,
      min_area_m2: 30.0,
      max_area_m2: 45.0,
    },
    {
      id: "need_kitchen",
      type: "kitchen",
      min_width_mm: 3000,
      max_width_mm: 6000,
      min_area_m2: 15.0,
      max_area_m2: 25.0,
    },
    {
      id: "need_bedroom",
      type: "bedroom",
      min_width_mm: 3600,
      max_width_mm: 6000,
      min_area_m2: 20.0,
      max_area_m2: 30.0,
    },
    {
      id: "need_bath",
      type: "bath",
      min_width_mm: 2000,
      max_width_mm: 3500,
      min_area_m2: 8.0,
      max_area_m2: 14.0,
    },
    {
      id: "need_terrace",
      type: "terrace",
      min_width_mm: 2500,
      max_width_mm: 5000,
      min_area_m2: 12.0,
      max_area_m2: 20.0,
    },
  ],
adjacencies: [
    { room_a: "need_living", room_b: "need_kitchen", relation: "door", strength: "hard" },
    { room_a: "need_living", room_b: "need_terrace", relation: "door", strength: "hard" },
    { room_a: "need_bedroom", room_b: "need_bath", relation: "door", strength: "hard" },
    { room_a: "need_living", room_b: "need_bedroom", relation: "wall", strength: "soft" },
  ] };
}
