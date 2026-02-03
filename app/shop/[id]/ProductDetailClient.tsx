"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";

type Props = {
  productId: number;
  productName: string;
  price: number;
  image: string | null;
  deliveryLabel: string;
};

export default function ProductDetailClient({
  productId,
  productName,
  price,
  image,
  deliveryLabel,
}: Props) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  function handleAddToCart() {
    addItem({ productId, name: productName, price, image, qty });
    router.push("/cart");
  }

  return (
    <>
      <div className="w-12 h-0.5 bg-[#6b5b7a] my-4" />
      {/* Shipping badge */}
      <div className="inline-block mt-4 px-4 py-2 rounded-full bg-[#6b5b7a] text-white text-sm font-medium">
        {deliveryLabel}
      </div>
      <div className="w-12 h-0.5 bg-[#6b5b7a] my-6" />
      {/* Quantity + Add to cart */}
      <div className="flex flex-wrap items-center gap-4 mt-6">
        <div className="flex items-stretch rounded-lg overflow-hidden border border-[#6b5b7a]/40 bg-white">
          <button
            type="button"
            onClick={() => setQty((n) => Math.max(1, n - 1))}
            className="w-11 h-11 flex items-center justify-center bg-[#6b5b7a] text-white hover:bg-[#5a4b6a] transition-colors"
            aria-label="ลดจำนวน"
          >
            <span className="text-xl font-medium">−</span>
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-14 text-center text-[#2d1b4e] font-medium border-0 border-x border-[#6b5b7a]/20 bg-white focus:outline-none focus:ring-0"
            aria-label="จำนวน"
          />
          <button
            type="button"
            onClick={() => setQty((n) => n + 1)}
            className="w-11 h-11 flex items-center justify-center bg-[#6b5b7a] text-white hover:bg-[#5a4b6a] transition-colors"
            aria-label="เพิ่มจำนวน"
          >
            <span className="text-xl font-medium">+</span>
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="px-8 py-3 rounded-lg bg-[#6b5b7a] text-white font-medium hover:bg-[#5a4b6a] transition-colors whitespace-nowrap"
        >
          เพิ่มลงในตะกร้าสินค้า
        </button>
      </div>
    </>
  );
}
