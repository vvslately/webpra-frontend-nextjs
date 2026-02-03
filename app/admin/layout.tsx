import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex">
      <aside className="w-56 shrink-0 bg-[#2d1b4e] text-white flex flex-col">
        <div className="p-4 border-b border-white/10">
          <Link href="/admin" className="font-bold text-lg text-white no-underline">
            หลังบ้าน
          </Link>
        </div>
        <nav className="p-4 flex flex-col gap-1">
          <Link
            href="/admin/products"
            className="px-3 py-2 rounded-lg text-white/90 no-underline hover:bg-white/10 hover:text-white transition-colors"
          >
            จัดการสินค้า
          </Link>
          <Link
            href="/admin/orders"
            className="px-3 py-2 rounded-lg text-white/90 no-underline hover:bg-white/10 hover:text-white transition-colors"
          >
            จัดการออเดอร์
          </Link>
          <Link
            href="/admin/users"
            className="px-3 py-2 rounded-lg text-white/90 no-underline hover:bg-white/10 hover:text-white transition-colors"
          >
            จัดการผู้ใช้งาน
          </Link>
          <Link
            href="/admin/contacts"
            className="px-3 py-2 rounded-lg text-white/90 no-underline hover:bg-white/10 hover:text-white transition-colors"
          >
            จัดการข้อมูลติดต่อ
          </Link>
        </nav>
        <div className="mt-auto p-4 border-t border-white/10">
          <Link
            href="/"
            className="text-sm text-white/70 no-underline hover:text-white"
          >
            ← กลับหน้าร้าน
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
