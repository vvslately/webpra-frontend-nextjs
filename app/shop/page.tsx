import Image from "next/image";
import Link from "next/link";
import { FadeUpWhenVisible } from "../components/FadeUpWhenVisible";
import { query } from "@/lib/db";
import type { Product } from "@/lib/types";

const PLACEHOLDER_IMAGE =
  "https://files.cdn-files-a.com/admin/system_photos_stock/2000_696430659d148.jpg";

async function getProducts(): Promise<Product[]> {
  try {
    const rows = await query<Product[]>(
      "SELECT id, name, subtitle, image, price, delivery_method FROM products ORDER BY created_at DESC"
    );
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <div className="min-h-screen bg-[#E6E0EB]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <FadeUpWhenVisible>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2d1b4e] text-center">
            ร้านค้า
          </h1>
          <div className="w-12 h-0.5 bg-[#6b5b7a] mx-auto my-4" />
        </FadeUpWhenVisible>
        {products.length === 0 ? (
          <FadeUpWhenVisible delay={80}>
            <p className="text-center text-[#666] py-12">ยังไม่มีสินค้า</p>
          </FadeUpWhenVisible>
        ) : (
          <FadeUpWhenVisible delay={80}>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
            {products.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/shop/${p.id}`}
                  className="block bg-white rounded-2xl shadow-md overflow-hidden border border-white/80 hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square bg-[#f5f3f7]">
                    <Image
                      src={p.image || PLACEHOLDER_IMAGE}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized
                    />
                  </div>
                  <div className="p-5">
                    <h2 className="font-bold text-[#2d1b4e] line-clamp-2">
                      {p.name}
                    </h2>
                    {p.subtitle && (
                      <p className="text-sm text-[#666] mt-1 line-clamp-2">
                        {p.subtitle}
                      </p>
                    )}
                    <p className="mt-3 font-bold text-[#6b5b7a]">
                      ฿{Number(p.price).toLocaleString("th-TH")}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          </FadeUpWhenVisible>
        )}
      </div>
    </div>
  );
}
