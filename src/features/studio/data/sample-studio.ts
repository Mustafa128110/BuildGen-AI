import type { InspectedEntity } from "../model/types";

export const ENTITIES: Record<string, InspectedEntity> = {
  terrace: {
    id: "#ENT-9042",
    title: "East Terrace Extension Module",
    badge: "PROPOSED DIFF",
    level: "Level 01 → Roof",
    area: "+19.2 m²",
    structure: "Glulam + Steel",
    shading: "Timber Louver (150mm)",
  },
  living: {
    id: "#ENT-1040",
    title: "Living & Dining Pavilion",
    badge: "PRIMARY CORE",
    level: "Level 01 (+450mm)",
    area: "68.5 m²",
    structure: "RC Shear + Steel",
    shading: "South Glazed Curtain",
  },
  master: {
    id: "#ENT-1018",
    title: "Master Suite Volume",
    badge: "WEST WING",
    level: "Level 01 (+450mm)",
    area: "42.4 m²",
    structure: "300mm Limestone Cavity",
    shading: "Deep Reveal Louvers",
  },
  courtyard: {
    id: "#ENT-2004",
    title: "Central Open Courtyard",
    badge: "ATRIUM VOID",
    level: "Datum 0.00m",
    area: "38.0 m²",
    structure: "Permeable Travertine",
    shading: "Open Sky Aperture",
  },
  bath: {
    id: "#ENT-1022",
    title: "Wet Core & Bath Suite",
    badge: "MEP CORE",
    level: "Level 01 (+450mm)",
    area: "14.8 m²",
    structure: "150mm Acoustic Partition",
    shading: "Clerestory North Slot",
  },
};
