export const TAB_PATH_STANDARD =
  "M.68,55.09c18,0,33.61-11.42,37.64-27.55h.01C42.39,11.43,58,0,75.98,0h145.6c18,0,33.61,11.42,37.64,27.55,4.05,16.12,19.66,27.55,37.64,27.55L0,55.23";

export const TAB_PATH_WIDE =
  "M.68,55.09c18,0,33.61-11.42,37.64-27.55h.01C42.39,11.43,58,0,75.98,0h172.5c18,0,33.61,11.42,37.64,27.55,4.05,16.12,19.66,27.55,37.64,27.55L0,55.23";

export interface ProjectItem {
  category: string;
  image: string;
  linework: string;
  renderOnGrid: boolean;
  labelPlacement: "above" | "below";
  labelGap: string;
  labelTilt: string;
  labelX: string;
}

export const PROJECT_ITEMS: ProjectItem[] = [
  {
    category: "Workplace",
    image: "/images/plamo/examples/through-lot-office.webp",
    linework: "/images/plamo/examples/through-lot-office-linework.webp",
    renderOnGrid: true,
    labelPlacement: "below",
    labelGap: "24px",
    labelTilt: "-2.2deg",
    labelX: "24%",
  },
  {
    category: "Mid-rise",
    image: "/images/plamo/examples/curved-brick-facade.webp",
    linework: "/images/plamo/examples/curved-brick-facade-linework.webp",
    renderOnGrid: false,
    labelPlacement: "above",
    labelGap: "29px",
    labelTilt: "1.5deg",
    labelX: "70%",
  },
  {
    category: "Cultural",
    image: "/images/plamo/examples/fin-screen-art-museum.webp",
    linework: "/images/plamo/examples/fin-screen-art-museum-linework.webp",
    renderOnGrid: false,
    labelPlacement: "below",
    labelGap: "21px",
    labelTilt: "-1.1deg",
    labelX: "68%",
  },
  {
    category: "Transit",
    image: "/images/plamo/examples/high-speed-rail-station.webp",
    linework: "/images/plamo/examples/high-speed-rail-station-linework.webp",
    renderOnGrid: false,
    labelPlacement: "above",
    labelGap: "26px",
    labelTilt: "2deg",
    labelX: "32%",
  },
  {
    category: "Structure",
    image: "/images/plamo/examples/steel-canopy.webp",
    linework: "/images/plamo/examples/steel-canopy-linework.webp",
    renderOnGrid: false,
    labelPlacement: "above",
    labelGap: "23px",
    labelTilt: "-1.7deg",
    labelX: "76%",
  },
  {
    category: "Data center",
    image: "/images/plamo/examples/data-center.webp",
    linework: "/images/plamo/examples/data-center-linework.webp",
    renderOnGrid: false,
    labelPlacement: "below",
    labelGap: "28px",
    labelTilt: "1.2deg",
    labelX: "26%",
  },
  {
    category: "Pavilion",
    image: "/images/plamo/examples/spine-shelter-pavilion.webp",
    linework: "/images/plamo/examples/spine-shelter-pavilion-linework.webp",
    renderOnGrid: true,
    labelPlacement: "below",
    labelGap: "22px",
    labelTilt: "-2.4deg",
    labelX: "64%",
  },
  {
    category: "Facade",
    image: "/images/plamo/examples/fin-facade-detail.webp",
    linework: "/images/plamo/examples/fin-facade-detail-linework.webp",
    renderOnGrid: true,
    labelPlacement: "above",
    labelGap: "30px",
    labelTilt: "1.6deg",
    labelX: "35%",
  },
  {
    category: "Hospitality",
    image: "/images/plamo/examples/bistro-and-bar.webp",
    linework: "/images/plamo/examples/bistro-and-bar-linework.webp",
    renderOnGrid: false,
    labelPlacement: "below",
    labelGap: "25px",
    labelTilt: "-1.3deg",
    labelX: "72%",
  },
];

export const ROADMAP_CHIPS = [
  "Site selection",
  ".3dm import",
  "BIM export (.ifc, .rvt)",
  "BIM template import (.rte)",
  "Custom skills and assets",
  "Direct 3D edit",
  "Mobile support",
  "Collaboration",
  "and many more...",
];
