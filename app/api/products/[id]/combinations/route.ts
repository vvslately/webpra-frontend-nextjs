import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    console.error("Get product combinations error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
