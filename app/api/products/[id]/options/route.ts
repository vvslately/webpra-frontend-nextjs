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

    const options = await query<
      Array<{
        id: number;
        name: string;
        display_order: number;
      }>
    >(
      "SELECT id, name, display_order FROM product_options WHERE product_id = ? ORDER BY display_order, id",
      [productId]
    );

    if (!options || options.length === 0) {
      return NextResponse.json({ options: [] });
    }

    const optionIds = options.map((o) => o.id);
    const placeholders = optionIds.map(() => "?").join(",");
    const values = await query<
      Array<{
        id: number;
        option_id: number;
        value: string;
        description: string | null;
        price_adjustment: string;
        image_url: string | null;
        display_order: number;
      }>
    >(
      `SELECT id, option_id, value, description, price_adjustment, image_url, display_order FROM product_option_values WHERE option_id IN (${placeholders}) ORDER BY option_id, display_order, id`,
      optionIds
    );

    const result = options.map((opt) => ({
      id: opt.id,
      name: opt.name,
      display_order: opt.display_order,
      values: (values || [])
        .filter((v) => v.option_id === opt.id)
        .map((v) => ({
          id: v.id,
          value: v.value,
          description: v.description,
          price_adjustment: Number(v.price_adjustment) || 0,
          image_url: v.image_url,
          display_order: v.display_order,
        })),
    }));

    return NextResponse.json({ options: result });
  } catch (e) {
    console.error("Get product options error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
