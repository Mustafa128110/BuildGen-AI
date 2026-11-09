import { AUTH_COOKIES,verifyAccessToken } from "@/lib/auth/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense,type ReactNode } from "react";

async function RequireUser({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const user = await verifyAccessToken(jar.get(AUTH_COOKIES.access)?.value);
  if (!user) redirect("/sign-in");
  return children;
}

// This check is independent of the proxy and never trusts client context/storage.
export default function MemberLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<p role="status">Checking your session...</p>}><RequireUser>{children}</RequireUser></Suspense>;
}
