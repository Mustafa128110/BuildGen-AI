"use client";
import { createRequirementsDraft } from "./model/defaults";
import { AdjacencyRequirement,RoomRequirement } from "./model/types";

import { useState } from "react";

export function useRequirements() {
  const [briefText, setBriefText] = useState(
    () => createRequirementsDraft().briefText
  );

  const [plotWidth, setPlotWidth] = useState(() => createRequirementsDraft().plotWidth); // mm
  const [plotDepth, setPlotDepth] = useState(() => createRequirementsDraft().plotDepth); // mm

  const [rooms, setRooms] = useState<RoomRequirement[]>(() => createRequirementsDraft().rooms);

  const [adjacencies] = useState<AdjacencyRequirement[]>(() => createRequirementsDraft().adjacencies);

  const [, setConfirmedVersion] = useState<string | null>(null);

  // AI Interpretation simulation (E43)
  const handleInterpretBrief = () => {
    alert(
      "AI Brief Interpretation (E43):\nExtracted 5 required rooms, plot boundary 14.45m x 9.80m, and 3 hard door connectivity requirements. Fields populated."
    );
  };

  const handleConfirm = () => {
    const vId = `REQ-V${Math.floor(Math.random() * 90 + 10)}`;
    setConfirmedVersion(vId);
    alert(
      `REQUIREMENTS CONFIRMED!\n\nVersion ID: ${vId}\nStatus: IMMUTABLE SNAPSHOT SAVED\n\nYou can now load this confirmed brief into the CAD Studio generator.`
    );
  };
  return { briefText, setBriefText, plotWidth, setPlotWidth, plotDepth, setPlotDepth, rooms, setRooms, adjacencies, handleInterpretBrief, handleConfirm };
}
