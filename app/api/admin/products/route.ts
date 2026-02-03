import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2/promise";
import { query } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";

export async function POST(request: Request) {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    const subtitle = (body.subtitle || "").trim() || null;
    const image = (body.image || "").trim() || null;
    const price = Number(body.price);
    const delivery_method = (body.delivery_method || body.deliveryMethod || "").trim() || null;

    if (!name) {
      return NextResponse.json({ error: "กรุณากรอกชื่อสินค้า" }, { status: 400 });
    }
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: "ราคาไม่ถูกต้อง" }, { status: 400 });
    }

    const result = await query<ResultSetHeader>(
      "INSERT INTO products (name, subtitle, image, price, delivery_method) VALUES (?, ?, ?, ?, ?)",
      [name, subtitle, image, price, delivery_method]
    );
    const id = result?.insertId;
    if (!id) {
      return NextResponse.json({ error: "สร้างสินค้าไม่สำเร็จ" }, { status: 500 });
    }
    return NextResponse.json({ id, message: "สร้างสินค้าสำเร็จ" });
  } catch (e) {
    console.error("Admin create product error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
