import { NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";

const ALLOWED_STATUSES = ["pending", "paid", "shipped", "cancelled"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (Number.isNaN(orderId)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
    }
    const body = await request.json();
    const status = (body.status || "").trim().toLowerCase();
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "สถานะไม่ถูกต้อง (pending, paid, shipped, cancelled)" },
        { status: 400 }
      );
    }
    await query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
    return NextResponse.json({ id: orderId, status, message: "อัปเดตสถานะสำเร็จ" });
  } catch (e) {
    console.error("Admin update order status error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (Number.isNaN(orderId)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
    }
    const orderRows = await query<
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
      "SELECT id, user_id, first_name, last_name, phone, address, total, status, created_at FROM orders WHERE id = ? LIMIT 1",
      [orderId]
    );
    const order = Array.isArray(orderRows) ? orderRows[0] : null;
    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }
    const itemRows = await query<
      {
        id: number;
        product_id: number;
        product_name: string;
        product_image: string | null;
        price: string;
        qty: number;
        selected_options: string | null;
      }[]
    >(
      "SELECT id, product_id, product_name, product_image, price, qty, selected_options FROM order_items WHERE order_id = ? ORDER BY id",
      [orderId]
    );
    const items = Array.isArray(itemRows)
      ? itemRows.map((item) => {
          let selectedOptions = null;
          if (item.selected_options) {
            try {
              // MySQL JSON type อาจ return เป็น object หรือ string
              if (typeof item.selected_options === 'string') {
                selectedOptions = JSON.parse(item.selected_options);
              } else if (typeof item.selected_options === 'object') {
                selectedOptions = item.selected_options;
              }
            } catch (e) {
              console.error("Error parsing selected_options:", e, item.selected_options);
              selectedOptions = null;
            }
          }
          return {
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            price: item.price,
            qty: item.qty,
            selected_options: selectedOptions,
          };
        })
      : [];
    return NextResponse.json({ order, items });
  } catch (e) {
    console.error("Admin get order error:", e);
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
    const orderId = parseInt(id, 10);
    if (Number.isNaN(orderId)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
    }
    const orderRows = await query<
      { id: number; user_id: number | null; total: string }[]
    >(
      "SELECT id, user_id, total FROM orders WHERE id = ? LIMIT 1",
      [orderId]
    );
    const order = Array.isArray(orderRows) ? orderRows[0] : null;
    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }
    const total = Number(order.total);
    const userId = order.user_id;

    await withTransaction(async (conn) => {
      if (userId != null && total > 0) {
        await conn.execute(
          "UPDATE users SET balance = balance + ? WHERE id = ?",
          [total, userId]
        );
      }
      await conn.execute("DELETE FROM order_items WHERE order_id = ?", [
        orderId,
      ]);
      await conn.execute("DELETE FROM orders WHERE id = ?", [orderId]);
    });

    return NextResponse.json({
      message: "ลบคำสั่งซื้อสำเร็จ",
      id: orderId,
    });
  } catch (e) {
    console.error("Admin delete order error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
