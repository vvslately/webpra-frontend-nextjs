"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-[#E6E0EB] flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-[#6b5b7a]/20 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-[#6b5b7a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#2d1b4e] mb-2">สั่งซื้อสำเร็จ</h1>
        <p className="text-[#666] mb-2">
          ขอบคุณที่สั่งซื้อกับเรา
        </p>
        {orderId && (
          <p className="text-sm text-[#6b5b7a] font-medium mb-6">
            เลขที่คำสั่งซื้อ: #{orderId}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="inline-block px-6 py-3 rounded-lg bg-[#6b5b7a] text-white font-medium hover:bg-[#5a4b6a] transition-colors"
          >
            ช้อปต่อ
          </Link>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg border border-[#6b5b7a] text-[#6b5b7a] font-medium hover:bg-[#6b5b7a]/10 transition-colors"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
