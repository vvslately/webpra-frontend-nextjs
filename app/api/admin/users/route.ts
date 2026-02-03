import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";

type UserRow = {
  id: number;
  username: string;
  email: string;
  role: string;
  balance: string;
  created_at: string;
};

export async function GET() {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const rows = await query<UserRow[]>(
      "SELECT id, username, email, role, balance, created_at FROM users ORDER BY id DESC LIMIT 200"
    );
    const users = Array.isArray(rows) ? rows : [];
    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        balance: Number(u.balance ?? 0),
        created_at: u.created_at,
      })),
    });
  } catch (e) {
    console.error("Admin list users error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
