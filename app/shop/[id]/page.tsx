import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import type { Product } from "@/lib/types";
import ProductDetailClient from "./ProductDetailClient";

const PLACEHOLDER_IMAGE =
  "https://files.cdn-files-a.com/admin/system_photos_stock/2000_696430659d148.jpg";

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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (Number.isNaN(productId)) notFound();
  const product = await getProduct(productId);
  if (!product) notFound();

  const priceNum = Number(product.price);
  const deliveryLabel = product.delivery_method || "ส่งฟรี";

  return (
    <div className="min-h-screen bg-[#E6E0EB]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 md:py-12">
        {/* Breadcrumbs */}
        <nav className="text-sm text-[#6b5b7a] mb-8" aria-label="breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/" className="hover:underline">
                หน้าแรก
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/shop" className="hover:underline">
                ร้านค้า
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-[#2d1b4e] truncate max-w-[200px] md:max-w-none" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Two columns: image left, details right */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
          {/* Product image */}
          <div className="w-full lg:w-[48%] shrink-0">
            <div className="relative aspect-square max-w-lg rounded-2xl overflow-hidden bg-white shadow-md border border-white/80">
              <Image
                src={product.image || PLACEHOLDER_IMAGE}
                alt={product.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Product details */}
          <div className="w-full lg:flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#2d1b4e]">
              {product.name}
            </h1>
            <div className="w-16 h-0.5 bg-[#6b5b7a] my-3" />
            {product.subtitle && (
              <p className="text-[#333] leading-relaxed mt-4 max-w-xl">
                {product.subtitle}
              </p>
            )}
            <div className="w-12 h-0.5 bg-[#6b5b7a]/60 my-4" />
            {/* Price */}
            <p className="text-2xl md:text-3xl font-bold text-[#2d1b4e]">
              ฿{priceNum.toLocaleString("th-TH")}
            </p>

            <ProductDetailClient
              productId={product.id}
              productName={product.name}
              price={priceNum}
              image={product.image}
              deliveryLabel={deliveryLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
