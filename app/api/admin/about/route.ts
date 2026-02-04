import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2/promise";
import { query } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET() {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const rows = await query<Array<{ id: number; image_url: string | null; content: string | null }>>(
      "SELECT id, image_url, content FROM about ORDER BY id DESC LIMIT 1"
    );
    const data = rows?.[0] ?? null;
    if (!data) {
      return NextResponse.json({
        id: null,
        image_url: null,
        content: null,
      });
    }
    return NextResponse.json({
      id: data.id,
      image_url: data.image_url,
      content: data.content,
    });
  } catch (e) {
    console.error("Admin get about error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const body = await request.json();
    const image_url = (body.image_url || "").trim() || null;
    const content = (body.content || "").trim() || null;

    const existing = await query<Array<{ id: number }>>(
      "SELECT id FROM about ORDER BY id DESC LIMIT 1"
    );
    const existingId = existing?.[0]?.id;

    if (existingId) {
      await query<ResultSetHeader>(
        "UPDATE about SET image_url = ?, content = ? WHERE id = ?",
        [image_url, content, existingId]
      );
      return NextResponse.json({
        id: existingId,
        message: "อัพเดทข้อมูลเกี่ยวกับเราสำเร็จ",
      });
    } else {
      const result = await query<ResultSetHeader>(
        "INSERT INTO about (image_url, content) VALUES (?, ?)",
        [image_url, content]
      );
      const id = result?.insertId;
      if (!id) {
        return NextResponse.json(
          { error: "สร้างข้อมูลไม่สำเร็จ" },
          { status: 500 }
        );
      }
      return NextResponse.json({
        id,
        message: "สร้างข้อมูลเกี่ยวกับเราสำเร็จ",
      });
    }
  } catch (e) {
    console.error("Admin update about error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
