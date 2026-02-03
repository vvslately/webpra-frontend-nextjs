import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import type { Product } from "@/lib/types";
import ProductForm from "../../ProductForm";

async function getProduct(id: number): Promise<Product | null> {
  try {
    const rows = await query<Product[]>(
      "SELECT id, name, subtitle, image, price, delivery_method FROM products WHERE id = ? LIMIT 1",
      [id]
    );
    const p = Array.isArray(rows) ? rows[0] : null;
    return p ?? null;
  } catch {
    return null;
  }
}

export default async function AdminProductsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (Number.isNaN(productId)) notFound();
  const product = await getProduct(productId);
  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="text-[#6b5b7a] hover:underline text-sm font-medium"
        >
          ← กลับรายการสินค้า
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">แก้ไขสินค้า</h1>
      <ProductForm
        mode="edit"
        product={{
          id: product.id,
          name: product.name,
          subtitle: product.subtitle ?? "",
          image: product.image ?? "",
          price: String(product.price),
          delivery_method: product.delivery_method ?? "",
        }}
      />
    </div>
  );
}
