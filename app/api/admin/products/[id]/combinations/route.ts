import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2/promise";
import { query, withTransaction } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";

type Combination = {
  id?: number;
  combination: Record<string, string[]>; // { "สี": ["แดง"], "ขนาด": ["L"] }
  price_adjustment?: number;
  display_order?: number;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdminApi();
  if (err) return err;
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (Number.isNaN(productId)) {
      return NextResponse.json({ error: "ID สินค้าไม่ถูกต้อง" }, { status: 400 });
    }

    const combinations = await query<
      Array<{
        id: number;
        combination: string;
        price_adjustment: string;
        display_order: number;
      }>
    >(
      "SELECT id, combination, price_adjustment, display_order FROM product_option_combinations WHERE product_id = ? ORDER BY display_order, id",
      [productId]
    );

    const result = (combinations || []).map((c) => {
      let combinationObj: Record<string, string[]> = {};
      try {
        combinationObj = JSON.parse(c.combination);
      } catch {
        // ignore parse error
      }
      return {
        id: c.id,
        combination: combinationObj,
        price_adjustment: Number(c.price_adjustment) || 0,
        display_order: c.display_order,
      };
    });

    return NextResponse.json({ combinations: result });
  } catch (e) {
    console.error("Admin get product combinations error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: "ID สินค้าไม่ถูกต้อง" }, { status: 400 });
    }

    const body = await request.json();
    const combinations: Combination[] = body.combinations || [];

    if (!Array.isArray(combinations)) {
      return NextResponse.json({ error: "combinations ต้องเป็น array" }, { status: 400 });
    }

    await withTransaction(async (conn) => {
      await conn.execute("DELETE FROM product_option_combinations WHERE product_id = ?", [productId]);

      for (let i = 0; i < combinations.length; i++) {
        const combo = combinations[i];
        if (!combo.combination || Object.keys(combo.combination).length === 0) {
          continue;
        }

        const combinationJson = JSON.stringify(combo.combination);
        await conn.execute<ResultSetHeader>(
          "INSERT INTO product_option_combinations (product_id, combination, price_adjustment, display_order) VALUES (?, ?, ?, ?)",
          [productId, combinationJson, combo.price_adjustment || 0, combo.display_order ?? i]
        );
      }
    });

    return NextResponse.json({ message: "อัพเดท combinations สำเร็จ" });
  } catch (e) {
    console.error("Admin update product combinations error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
