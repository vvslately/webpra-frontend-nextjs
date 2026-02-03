import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET() {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const rows = await query<
      {
        id: number;
        user_id: number | null;
        first_name: string;
        last_name: string;
        phone: string;
        address: string;
        total: string;
        status: string;
        created_at: string;
      }[]
    >(
      "SELECT id, user_id, first_name, last_name, phone, address, total, status, created_at FROM orders ORDER BY id DESC LIMIT 200"
    );
    const orders = Array.isArray(rows) ? rows : [];
    return NextResponse.json({ orders });
  } catch (e) {
    console.error("Admin list orders error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
