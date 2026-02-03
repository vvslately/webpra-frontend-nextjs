import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, getAuthCookieName } from "@/lib/auth";
import type { JWTPayload } from "@/lib/auth";

/**
 * Get admin session from cookie. Returns payload if role is admin, null otherwise.
 * Use in Server Components (admin layout/pages).
 */
export async function getAdminSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

/**
 * Require admin. Redirect to /login if not admin.
 * Call at top of admin layout.
 */
export async function requireAdmin(): Promise<JWTPayload> {
  const payload = await getAdminSession();
  if (!payload) redirect("/login");
  return payload;
}
