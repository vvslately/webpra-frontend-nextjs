import Image from "next/image";
import Link from "next/link";
import { query } from "@/lib/db";
import type { Product } from "@/lib/types";
import DeleteProductButton from "./DeleteProductButton";

const PLACEHOLDER =
  "https://files.cdn-files-a.com/admin/system_photos_stock/2000_696430659d148.jpg";

async function getProducts(): Promise<Product[]> {
  try {
    const rows = await query<Product[]>(
      "SELECT id, name, subtitle, image, price, delivery_method, created_at, updated_at FROM products ORDER BY id DESC"
    );
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export default async function AdminProductsPage() {
  const products = await getProducts();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#2d1b4e]">จัดการสินค้า</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 rounded-lg bg-[#6b5b7a] text-white font-medium hover:bg-[#5a4b6a] transition-colors no-underline"
        >
          เพิ่มสินค้า
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f8f6fa] text-left text-sm font-semibold text-[#2d1b4e]">
                <th className="py-3 px-4 w-16">รูป</th>
                <th className="py-3 px-4">ชื่อ</th>
                <th className="py-3 px-4">ราคา</th>
                <th className="py-3 px-4">จัดส่ง</th>
                <th className="py-3 px-4 w-24 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#666]">
                    ยังไม่มีสินค้า
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={p.image || PLACEHOLDER}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#2d1b4e]">{p.name}</span>
                      {p.subtitle && (
                        <p className="text-xs text-[#666] mt-0.5 line-clamp-1">
                          {p.subtitle}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#6b5b7a] font-medium">
                      ฿{Number(p.price).toLocaleString("th-TH")}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#666]">
                      {p.delivery_method || "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-[#6b5b7a] hover:underline text-sm font-medium"
                      >
                        แก้ไข
                      </Link>
                      <span className="mx-2 text-gray-300">|</span>
                      <DeleteProductButton productId={p.id} productName={p.name} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

