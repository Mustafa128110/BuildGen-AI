// Existing academic fixture; not a live calculation or validation result.
export const checks = [
    {
      code: "schema_valid",
      title: "Canonical Schema Structure",
      evidence: "Integer mm, 10mm grid, JSON Schema Draft 2020-12 compliant",
      status: "PASS",
    },
    {
      code: "polygon_valid",
      title: "Non-Self-Intersecting Rings",
      evidence: "All 5 room rings are simple closed counterclockwise polygons",
      status: "PASS",
    },
    {
      code: "rectilinear",
      title: "90° Orthogonal Alignment",
      evidence: "All wall axes and room segments lie parallel to coordinate axes",
      status: "PASS",
    },
    {
      code: "plot_containment",
      title: "Boundary Containment",
      evidence: "All elements strictly contained within 14,450 x 9,800 mm boundary",
      status: "PASS",
    },
    {
      code: "room_overlap",
      title: "Non-Overlapping Rooms",
      evidence: "Shapely pairwise intersection area = 0.00 mm² (Zero overlap)",
      status: "PASS",
    },
    {
      code: "dimension_bounds",
      title: "Room Dimensional Minima",
      evidence: "Living (7.0m x 4.8m) ≥ 4.0m requirement; Master (5.6m x 4.6m) ≥ 3.0m",
      status: "PASS",
    },
    {
      code: "wall_consistency",
      title: "Bearing Wall Envelope & Thickness",
      evidence: "200mm uniform thickness; union volume = 24.92 m³",
      status: "PASS",
    },
    {
      code: "door_connectivity",
      title: "Accessibility & Door Graph",
      evidence: "Graph: Exterior → Living → Kitchen, Bedroom, Ensuite, Terrace accessible",
      status: "PASS",
    },
    {
      code: "local_kbca_rules",
      title: "Karachi Building Authority (KBCA) Rules",
      evidence: "Unverified rule pack; requires certified local jurisdiction pack",
      status: "UNKNOWN",
    },
  ];
