import type { ArchitecturalProject } from "./types";

export interface ProjectFilters { selectedCategory: string; searchQuery: string; sortBy: string }
export interface CreateProjectInput { newTitle: string; newArea: string; newCategory: ArchitecturalProject["category"]; newZoning: string; newLevels: string; newPrompt: string; createPreset: "ai" | "blank" }

export function selectProjects(projects: readonly ArchitecturalProject[], { selectedCategory, searchQuery, sortBy }: ProjectFilters) {
  return projects
      .filter((p) => {
        const matchesCat =
          selectedCategory === "All" ||
          p.category.toLowerCase() === selectedCategory.toLowerCase();
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.plotCode.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.zoning.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "area-desc") return b.areaNum - a.areaNum;
        if (sortBy === "area-asc") return a.areaNum - b.areaNum;
        if (sortBy === "lod") return b.lodNum - a.lodNum;
        return a.revisionOrder - b.revisionOrder;
      });
}

export function createProject({newTitle,newArea,newCategory,newZoning,newLevels,newPrompt,createPreset}: CreateProjectInput, projectCount: number, sample: Pick<ArchitecturalProject,"image"|"renderImage">, now: number) {
    const nextIdx = String(projectCount + 1).padStart(2, "0");
    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const numericArea = parseInt(newArea.replace(/[^0-9]/g, ""), 10) || 1200;

    const created: ArchitecturalProject = {
      index: nextIdx,
      id: `${slug || "plot"}-${nextIdx}-${now.toString(36).slice(-4)}`,
      plotCode: `PLOT // SP-${100 + projectCount + 1}`,
      title: newTitle,
      subtitle:
        createPreset === "ai"
          ? newPrompt
          : "Custom orthographic schematic initialized on 100mm structural grid.",
      category: newCategory,
      statusLabel: createPreset === "ai" ? "AI SYNTHESIS" : "DRAFTING",
      statusColor: createPreset === "ai" ? "vermilion" : "cobalt",
      statusPulse: createPreset === "ai",
      area: `${numericArea.toLocaleString()} m²`,
      areaNum: numericArea,
      lod: "LOD 300",
      lodNum: 300,
      updated: "Just now",
      revisionOrder: 0,
      zoning: newZoning,
      levels: newLevels,
      ctaLabel: "Open Canvas",
      image: sample.image,
      renderImage: sample.renderImage,
      imageAlt: `Architectural blueprint for ${newTitle}`,
    };
    return created;
}
