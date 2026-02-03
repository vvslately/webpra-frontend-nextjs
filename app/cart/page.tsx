"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const PLACEHOLDER_IMAGE =
  "https://files.cdn-files-a.com/admin/system_photos_stock/2000_696430659d148.jpg";

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQty, totalAmount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#E6E0EB] flex items-center justify-center px-6 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2d1b4e] mb-2">ตะกร้าสินค้า</h1>
          <p className="text-[#666] mb-6">ยังไม่มีสินค้าในตะกร้า</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 rounded-lg bg-[#6b5b7a] text-white font-medium hover:bg-[#5a4b6a] transition-colors"
          >
            ไปช้อปปิ้ง
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6E0EB]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2d1b4e] mb-8">
          ตะกร้าสินค้า
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left: Product list */}
          <div className="flex-1 bg-white rounded-2xl shadow-md border border-white/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#f8f6fa] text-left text-sm font-semibold text-[#2d1b4e] uppercase tracking-wide">
                    <th className="py-4 px-4">สินค้า</th>
                    <th className="py-4 px-4 w-24 text-center">ราคา</th>
                    <th className="py-4 px-4 w-32 text-center">จำนวน</th>
                    <th className="py-4 px-4 w-28 text-right">รวม</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.productId}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-[#f5f3f7] group">
                            <Image
                              src={item.image || PLACEHOLDER_IMAGE}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                              unoptimized
                            />
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-opacity"
                              aria-label="ลบออกจากตะกร้า"
                            >
                              <XIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div>
                            <Link
                              href={`/shop/${item.productId}`}
                              className="font-medium text-[#2d1b4e] hover:text-[#6b5b7a] hover:underline"
                            >
                              {item.name}
                            </Link>
                            <p className="text-xs text-[#666] mt-0.5">
                              #{item.productId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-[#2d1b4e] font-medium">
                        ฿{item.price.toLocaleString("th-TH")}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-0 rounded-lg overflow-hidden border border-[#6b5b7a]/30 bg-white w-fit mx-auto">
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(item.productId, Math.max(0, item.qty - 1))
                            }
                            className="w-9 h-9 flex items-center justify-center text-[#6b5b7a] hover:bg-[#6b5b7a]/10 transition-colors"
                            aria-label="ลดจำนวน"
                          >
                            −
                          </button>
                          <span className="w-10 text-center text-sm font-medium text-[#2d1b4e]">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.productId, item.qty + 1)}
                            className="w-9 h-9 flex items-center justify-center text-[#6b5b7a] hover:bg-[#6b5b7a]/10 transition-colors"
                            aria-label="เพิ่มจำนวน"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-[#2d1b4e]">
                        ฿{(item.price * item.qty).toLocaleString("th-TH")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Cart summary & checkout */}
          <div className="lg:w-[360px] shrink-0">
            <div className="bg-[#F5F3F7] rounded-2xl shadow-md border border-white/80 p-6 md:p-8 relative overflow-hidden">
              <div className="w-12 h-0.5 bg-[#6b5b7a] mb-6" />
              <h2 className="text-sm font-semibold text-[#666] uppercase tracking-wide mb-1">
                ยอดรวมตะกร้า
              </h2>
              <p className="text-2xl md:text-3xl font-bold text-[#2d1b4e] mb-4">
                ฿{totalAmount.toLocaleString("th-TH")}
              </p>
              <p className="text-sm text-[#666] mb-6">
                ค่าขนส่งและภาษีจะคำนวณที่ขั้นตอนชำระเงิน
              </p>
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-[#6b5b7a] text-[#6b5b7a] focus:ring-[#6b5b7a]"
                />
                <span className="text-sm text-[#333]">
                  ฉันยอมรับ{" "}
                  <Link href="#" className="text-[#6b5b7a] hover:underline">
                    ข้อกำหนดและเงื่อนไข
                  </Link>
                </span>
              </label>
              <Link
                href="/cart/checkout"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-[#2d1b4e] text-white font-semibold hover:bg-[#3d2b5e] transition-colors"
              >
                ชำระเงิน
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </Link>
              <p className="text-center text-sm text-[#666] mt-4">
                ชำระเงินอย่างปลอดภัย
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
