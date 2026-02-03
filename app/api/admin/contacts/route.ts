import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";

type ContactRow = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  created_at: string;
};

export async function GET() {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const rows = await query<ContactRow[]>(
      "SELECT id, name, phone, email, message, created_at FROM contacts ORDER BY id DESC LIMIT 200"
    );
    const contacts = Array.isArray(rows) ? rows : [];
    return NextResponse.json({ contacts });
  } catch (e) {
    console.error("Admin list contacts error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
