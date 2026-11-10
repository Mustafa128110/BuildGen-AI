import type { BlueprintNode } from "../model/page-types";

export const BLUEPRINT_NODES: BlueprintNode[] = [
  {
    id: "NODE A-109",
    label: "NODE A-109",
    sublabel: "APEX +24.50",
    cx: 420,
    cy: 120,
    elevation: "+24.50m",
    load: "142.8 kN // CANTILEVER",
  },
  {
    id: "NODE B-204",
    label: "NODE B-204",
    sublabel: "DATUM +14.20",
    cx: 180,
    cy: 120,
    elevation: "+14.20m",
    load: "218.4 kN // SHEAR CORE",
  },
  {
    id: "NODE C-312",
    label: "NODE C-312",
    sublabel: "PLINTH 0.00",
    cx: 100,
    cy: 330,
    elevation: "+0.00m",
    load: "390.0 kN // FOUNDATION",
  },
  {
    id: "NODE D-408",
    label: "NODE D-408",
    sublabel: "SPAN +18.60",
    cx: 520,
    cy: 260,
    elevation: "+18.60m",
    load: "164.2 kN // TRUSS",
  },
];
