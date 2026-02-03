import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken, getAuthCookieName } from "@/lib/auth";

/**
 * Check admin from request cookie. Returns 401 JSON if not admin.
 * Use in API Route Handlers: const err = await requireAdminApi(request); if (err) return err;
 */
export async function requireAdminApi(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  if (!token) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }
  return null;
}
