export type AuthMode = "signin" | "signup";

export interface BlueprintNode {
  id: string;
  label: string;
  sublabel: string;
  cx: number;
  cy: number;
  elevation: string;
  load: string;
}
