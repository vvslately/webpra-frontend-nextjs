"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (items.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-[#E6E0EB] flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#2d1b4e] mb-2">ขั้นตอนชำระเงิน</h1>
          <p className="text-[#666] mb-6">ไม่มีสินค้าในตะกร้า กรุณาเพิ่มสินค้าก่อน</p>
          <Link
            href="/cart"
            className="inline-block px-6 py-3 rounded-lg bg-[#6b5b7a] text-white font-medium hover:bg-[#5a4b6a] transition-colors"
          >
            กลับไปตะกร้า
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!agreeTerms) {
      setError("กรุณายอมรับข้อกำหนดและเงื่อนไข");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          items: items.map((x) => ({
            productId: x.productId,
            name: x.name,
            image: x.image,
            price: x.price,
            qty: x.qty,
            selectedOptions: x.selectedOptions || null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "สร้างคำสั่งซื้อไม่สำเร็จ");
        return;
      }
      clearCart();
      router.push(`/cart/success?orderId=${data.orderId}`);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#E6E0EB]">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2d1b4e] mb-8">
          ขั้นตอนชำระเงิน
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left: Shipping form */}
          <div className="flex-1 bg-white rounded-2xl shadow-md border border-white/80 p-6 md:p-8">
            <h2 className="text-lg font-bold text-[#2d1b4e] mb-4">ข้อมูลจัดส่ง</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[#333] mb-1">
                    ชื่อจริง <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent"
                    placeholder="ชื่อจริง"
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[#333] mb-1">
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent"
                    placeholder="นามสกุล"
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#333] mb-1">
                  เบอร์ติดต่อ <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent"
                  placeholder="เช่น 08x xxx xxxx"
                  required
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-[#333] mb-1">
                  ที่อยู่จัดส่ง <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent resize-y"
                  placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                  required
                  autoComplete="street-address"
                />
              </div>
            </div>
          </div>

          {/* Right: Summary + submit */}
          <div className="lg:w-[360px] shrink-0">
            <div className="bg-[#F5F3F7] rounded-2xl shadow-md border border-white/80 p-6 md:p-8 sticky top-24">
              <div className="w-12 h-0.5 bg-[#6b5b7a] mb-6" />
              <h2 className="text-sm font-semibold text-[#666] uppercase tracking-wide mb-1">
                ยอดรวมตะกร้า
              </h2>
              <p className="text-2xl md:text-3xl font-bold text-[#2d1b4e] mb-4">
                ฿{totalAmount.toLocaleString("th-TH")}
              </p>
              <p className="text-sm text-[#666] mb-6">
                ค่าขนส่งและภาษีจะคำนวณที่ขั้นตอนถัดไป
              </p>
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[#6b5b7a] text-[#6b5b7a] focus:ring-[#6b5b7a]"
                  required
                  aria-describedby="terms-hint"
                />
                <span id="terms-hint" className="text-sm text-[#333]">
                  ฉันยอมรับ{" "}
                  <Link href="#" className="text-[#6b5b7a] hover:underline">
                    ข้อกำหนดและเงื่อนไข
                  </Link>{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              {!agreeTerms && (
                <p className="text-sm text-[#666] mb-4">
                  กรุณาติ๊กยอมรับข้อกำหนดและเงื่อนไขก่อนยืนยันคำสั่งซื้อ
                </p>
              )}
              {error && (
                <p className="text-sm text-red-600 mb-4" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !agreeTerms}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-[#2d1b4e] text-white font-semibold hover:bg-[#3d2b5e] disabled:opacity-60 transition-colors"
              >
                {loading ? "กำลังสร้างคำสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ"}
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
              </button>
              <Link
                href="/cart"
                className="block text-center text-sm text-[#6b5b7a] hover:underline mt-4"
              >
                กลับไปตะกร้า
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
