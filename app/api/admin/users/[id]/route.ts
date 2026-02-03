import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";

type UserRow = {
  id: number;
  username: string;
  email: string;
  role: string;
  balance: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
    }
    const rows = await query<UserRow[]>(
      "SELECT id, username, email, role, balance FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    const user = Array.isArray(rows) ? rows[0] : null;
    if (!user) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
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
  } catch (e) {
    console.error("Admin get user error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
    }
    const body = await request.json();
    const role = (body.role || "").trim().toLowerCase();
    const balance = typeof body.balance === "number" ? body.balance : parseFloat(String(body.balance ?? 0));

    if (role && role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "role ต้องเป็น admin หรือ user" }, { status: 400 });
    }
    if (Number.isNaN(balance) || balance < 0) {
      return NextResponse.json({ error: "ยอดคงเหลือต้องเป็นตัวเลขไม่ติดลบ" }, { status: 400 });
    }

    if (role) {
      await query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    }
    await query("UPDATE users SET balance = ? WHERE id = ?", [balance, userId]);

    return NextResponse.json({ id: userId, message: "อัปเดตผู้ใช้สำเร็จ" });
  } catch (e) {
    console.error("Admin update user error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
