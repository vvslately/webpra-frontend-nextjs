import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ResultSetHeader } from "mysql2/promise";
import { query, withTransaction } from "@/lib/db";
import { verifyToken, getAuthCookieName } from "@/lib/auth";

type BodyItem = {
  productId: number;
  name: string;
  image: string | null;
  price: number;
  qty: number;
};

type Body = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  items: BodyItem[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const firstName = (body.firstName || "").trim();
    const lastName = (body.lastName || "").trim();
    const phone = (body.phone || "").trim();
    const address = (body.address || "").trim();
    const items = Array.isArray(body.items) ? body.items : [];

    if (!firstName || !lastName || !phone || !address) {
      return NextResponse.json(
        { error: "กรุณากรอก ชื่อจริง นามสกุล เบอร์ติดต่อ และที่อยู่" },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "ไม่มีรายการสินค้าในตะกร้า" },
        { status: 400 }
      );
    }

    const total = items.reduce((sum, x) => sum + x.price * x.qty, 0);
    if (total <= 0) {
      return NextResponse.json(
        { error: "ยอดรวมไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    let userId: number | null = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(getAuthCookieName())?.value;
      if (token) {
        const payload = await verifyToken(token);
        if (payload) userId = parseInt(payload.sub, 10) || null;
      }
    } catch {
      // guest order
    }

    if (userId) {
      const balanceRows = await query<{ balance: string }[]>(
        "SELECT balance FROM users WHERE id = ? LIMIT 1",
        [userId]
      );
      const balance = balanceRows?.[0]?.balance;
      const balanceNum = balance != null ? Number(balance) : 0;
      if (balanceNum < total) {
        return NextResponse.json(
          { error: `ยอดคงเหลือไม่พอ (คงเหลือ ฿${balanceNum.toLocaleString("th-TH")} ยอดสั่งซื้อ ฿${total.toLocaleString("th-TH")})` },
          { status: 400 }
        );
      }
    }

    const orderId = await withTransaction(async (conn) => {
      const [insertOrder] = await conn.execute<ResultSetHeader>(
        "INSERT INTO orders (user_id, first_name, last_name, phone, address, total, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')",
        [userId, firstName, lastName, phone, address, total]
      );
      const id = insertOrder?.insertId;
      if (!id) throw new Error("สร้างคำสั่งซื้อไม่สำเร็จ");
      for (const item of items) {
        await conn.execute(
          "INSERT INTO order_items (order_id, product_id, product_name, product_image, price, qty) VALUES (?, ?, ?, ?, ?, ?)",
          [
            id,
            item.productId,
            item.name,
            item.image ?? null,
            item.price,
            Math.max(1, item.qty),
          ]
        );
      }
      if (userId) {
        await conn.execute(
          "UPDATE users SET balance = balance - ? WHERE id = ?",
          [total, userId]
        );
      }
      return id;
    });

    return NextResponse.json({
      orderId,
      message: "สร้างคำสั่งซื้อสำเร็จ",
    });
  } catch (e) {
    console.error("Create order error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ" },
      { status: 500 }
    );
  }
}
