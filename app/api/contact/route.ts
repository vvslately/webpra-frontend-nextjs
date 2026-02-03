import { NextResponse } from "next/server";
import { query } from "@/lib/db";

type Body = {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const name = (body.name || "").trim();
    const phone = (body.phone || "").trim() || null;
    const email = (body.email || "").trim() || null;
    const message = (body.message || "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อ" },
        { status: 400 }
      );
    }
    if (!message) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อความ" },
        { status: 400 }
      );
    }

    await query(
      "INSERT INTO contacts (name, phone, email, message) VALUES (?, ?, ?, ?)",
      [name, phone, email, message]
    );

    return NextResponse.json({
      message: "บันทึกข้อความติดต่อเรียบร้อย เราจะติดต่อกลับโดยเร็ว",
    });
  } catch (e) {
    console.error("Contact save error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งข้อความ" },
      { status: 500 }
    );
  }
}
