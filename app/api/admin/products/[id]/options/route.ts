import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2/promise";
import { query, withTransaction } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";

type OptionValue = {
  id?: number;
  value: string;
  description?: string | null;
  price_adjustment?: number;
  image_url?: string | null;
  display_order?: number;
};

type Option = {
  id?: number;
  name: string;
  display_order?: number;
  values: OptionValue[];
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
    console.error("Admin get product options error:", e);
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
    const options: Option[] = body.options || [];

    if (!Array.isArray(options)) {
      return NextResponse.json({ error: "options ต้องเป็น array" }, { status: 400 });
    }

    await withTransaction(async (conn) => {
      const [existingOptions] = await conn.execute<Array<{ id: number }>>(
        "SELECT id FROM product_options WHERE product_id = ?",
        [productId]
      );
      const existingOptionIds = (existingOptions || []).map((o) => o.id);

      if (existingOptionIds.length > 0) {
        const placeholders = existingOptionIds.map(() => "?").join(",");
        await conn.execute(
          `DELETE FROM product_option_values WHERE option_id IN (${placeholders})`,
          existingOptionIds
        );
        await conn.execute("DELETE FROM product_options WHERE product_id = ?", [productId]);
      }

      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        if (!opt.name || !opt.name.trim()) {
          continue;
        }

        const [optionResult] = await conn.execute<ResultSetHeader>(
          "INSERT INTO product_options (product_id, name, display_order) VALUES (?, ?, ?)",
          [productId, opt.name.trim(), opt.display_order ?? i]
        );
        const optionId = optionResult?.insertId;
        if (!optionId) continue;

        if (opt.values && Array.isArray(opt.values)) {
          for (let j = 0; j < opt.values.length; j++) {
            const val = opt.values[j];
            if (!val.value || !val.value.trim()) {
              continue;
            }
            await conn.execute<ResultSetHeader>(
              "INSERT INTO product_option_values (option_id, value, description, price_adjustment, image_url, display_order) VALUES (?, ?, ?, ?, ?, ?)",
              [optionId, val.value.trim(), val.description?.trim() || null, val.price_adjustment || 0, val.image_url || null, val.display_order ?? j]
            );
          }
        }
      }
    });

    return NextResponse.json({ message: "อัพเดท options สำเร็จ" });
  } catch (e) {
    console.error("Admin update product options error:", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
