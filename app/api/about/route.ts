import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query<Array<{ id: number; image_url: string | null; content: string | null }>>(
      "SELECT id, image_url, content FROM about ORDER BY id DESC LIMIT 1"
    );
    const data = rows?.[0] ?? null;
    if (!data) {
      return NextResponse.json({
        image_url: null,
        content: null,
      });
    }
    return NextResponse.json({
      image_url: data.image_url,
      content: data.content,
    });
  } catch (e) {
    console.error("Get about error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
