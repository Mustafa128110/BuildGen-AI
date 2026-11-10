export interface ProjectReference { readonly name: string; readonly code: string }

// Shared sample identity catalogue; never a member-data repository.
const sampleReferences: Record<string, ProjectReference> = {
  "villa-sognate": { name: "Villa Sognate", code: "VS-049" },
  "nordic-horizon": { name: "Nordic Horizon Mixed-Use", code: "NH-112" },
  "atelier-pavilion": { name: "Atelier Pavilion", code: "AP-088" },
  "kyoto-townhome": { name: "Kyoto Urban Townhome", code: "KT-204" },
  "aero-industrial": { name: "Aero Industrial Park Hub", code: "AI-501" },
};
export const SAMPLE_PROJECT_REFERENCES: Readonly<Record<string, ProjectReference>> = Object.freeze(Object.fromEntries(Object.entries(sampleReferences).map(([id, meta]) => [id, Object.freeze(meta)])));

export function resolveProjectReference(slug: string): ProjectReference {
  const sample = Object.hasOwn(SAMPLE_PROJECT_REFERENCES, slug) ? SAMPLE_PROJECT_REFERENCES[slug] : undefined;
  return sample ? { ...sample } : {
    name: slug.replace(/-[0-9]{2}-[a-z0-9]{4}$/i, "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    code: "SP-106",
  };
}
