import type { CopilotMessage,ViewportMode } from "../model/types";

export interface StudioPatch { louverDensity?: number; diffStatus?: "proposed"; viewportMode?: ViewportMode; sunShadows?: boolean; shadowAngle?: number; extrusionHeight?: number }
export interface CopilotProposal { text: string; metrics: NonNullable<CopilotMessage["metrics"]>; patch: StudioPatch }

// Deterministic academic simulation. This does not invoke an AI model.
export function proposeStudioChange(text: string): CopilotProposal {
  const lower = text.toLowerCase();
  const patch: StudioPatch = {};
      let responseText =
        "Updated parametric BIM topology and recalculated cantilever load paths along Grid Axis D.";
      let metrics = {
        span: "2,400 mm [PASS]",
        solar: "-41% kWh/m²",
        gfa: "124.9 m² (+19.2)",
      };

      if (lower.includes("louver") || lower.includes("pergola")) {
        patch.louverDensity = 10;
        patch.diffStatus = "proposed";
        responseText =
          "Increased timber pergola louver density to 10 blades @ 120mm pitch. Peak summer solar gain reduced by an additional 9.4%.";
        metrics = {
          span: "2,400 mm [PASS]",
          solar: "-47% kWh/m²",
          gfa: "124.9 m² (+19.2)",
        };
      } else if (lower.includes("sun") || lower.includes("solstice")) {
        patch.viewportMode = "3d";
        patch.sunShadows = true;
        patch.shadowAngle = 165;
        responseText =
          "Executed Summer Solstice (June 21, 14:00) solar altitude simulation. Cast shadow vectors updated across East Terrace plinth.";
      } else if (lower.includes("facade") || lower.includes("level 02") || lower.includes("extrude")) {
        patch.viewportMode = "3d";
        patch.extrusionHeight = 3600;
        responseText =
          "Aligned East Facade datum with Level 02 (+3,600mm) and synchronized glulam edge beam elevation.";
        metrics = {
          span: "2,400 mm [PASS]",
          solar: "-40% kWh/m²",
          gfa: "128.4 m² (+22.7)",
        };
      }
  return { text: responseText, metrics, patch };
}
