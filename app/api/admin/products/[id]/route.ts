import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (Number.isNaN(productId)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
    }
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

    await query(
      "UPDATE products SET name = ?, subtitle = ?, image = ?, price = ?, delivery_method = ? WHERE id = ?",
      [name, subtitle, image, price, delivery_method, productId]
    );
    return NextResponse.json({ id: productId, message: "อัปเดตสินค้าสำเร็จ" });
  } catch (e) {
    console.error("Admin update product error:", e);
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
    const productId = parseInt(id, 10);
    if (Number.isNaN(productId)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
    }
    await query("DELETE FROM products WHERE id = ?", [productId]);
    return NextResponse.json({ message: "ลบสินค้าสำเร็จ" });
  } catch (e) {
    console.error("Admin delete product error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
