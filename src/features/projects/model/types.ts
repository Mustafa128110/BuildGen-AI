export interface ArchitecturalProject {
  index: string;
  id: string;
  plotCode: string;
  title: string;
  subtitle: string;
  category: "Residential" | "Commercial" | "Multi-Family" | "Urban" | "Cultural";
  statusLabel: string;
  statusColor: "cobalt" | "vermilion" | "ink";
  statusPulse?: boolean;
  area: string;
  areaNum: number;
  lod: string;
  lodNum: number;
  updated: string;
  revisionOrder: number;
  zoning: string;
  levels: string;
  ctaLabel: string;
  image: string;
  renderImage: string;
  imageAlt: string;
}
