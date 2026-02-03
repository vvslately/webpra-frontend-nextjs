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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const { id } = await params;
    const contactId = parseInt(id, 10);
    if (Number.isNaN(contactId)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
    }
    const rows = await query<ContactRow[]>(
      "SELECT id, name, phone, email, message, created_at FROM contacts WHERE id = ? LIMIT 1",
      [contactId]
    );
    const contact = Array.isArray(rows) ? rows[0] : null;
    if (!contact) {
      return NextResponse.json({ error: "ไม่พบข้อความติดต่อ" }, { status: 404 });
    }
    return NextResponse.json({ contact });
  } catch (e) {
    console.error("Admin get contact error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const { id } = await params;
    const contactId = parseInt(id, 10);
    if (Number.isNaN(contactId)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
    }
    await query("DELETE FROM contacts WHERE id = ?", [contactId]);
    return NextResponse.json({ message: "ลบข้อความติดต่อสำเร็จ" });
  } catch (e) {
    console.error("Admin delete contact error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
