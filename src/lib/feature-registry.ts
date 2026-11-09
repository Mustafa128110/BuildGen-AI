// Shared routing metadata only. Feature implementations never import one another.
export const FEATURE_REGISTRY = {
  marketing: { memberRoutes: [], publicRoutes: ["/", "/about"] },
  auth: { memberRoutes: [], publicRoutes: ["/sign-in", "/login", "/auth/confirm"] },
  projects: { memberRoutes: ["/dashboard", "/projects"] },
  studio: { memberRoutes: ["/studio", "/cad"] },
  requirements: { memberRoutes: ["/requirements"] },
  drafting: { memberRoutes: [] },
} as const;

export type FeatureId = keyof typeof FEATURE_REGISTRY;
export const MEMBER_PATHS: readonly string[] = Object.values(FEATURE_REGISTRY).flatMap((feature) => [...feature.memberRoutes]);

export function isMemberPath(pathname: string): boolean {
  return MEMBER_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
