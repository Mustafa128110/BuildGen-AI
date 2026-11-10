import { SessionLoadingScreen } from "@/features/auth/member-layout";

export default function Loading() {
  return (
    <SessionLoadingScreen
      title="Loading Workspace"
      subtitle="Synchronizing architectural model..."
    />
  );
}
