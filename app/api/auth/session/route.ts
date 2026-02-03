import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getAuthCookieName } from "@/lib/auth";
import { query } from "@/lib/db";

type UserRow = {
  id: number;
  username: string;
  email: string;
  role: string;
  balance: string;
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAuthCookieName())?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ user: null });
    }

    const rows = await query<UserRow[]>(
      "SELECT id, username, email, role, balance FROM users WHERE id = ? LIMIT 1",
      [payload.sub]
    );
    const user = Array.isArray(rows) ? rows[0] : null;
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: Number(user.balance ?? 0),
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
