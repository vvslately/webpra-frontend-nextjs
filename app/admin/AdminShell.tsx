"use client";

import Link from "next/link";
import { useState } from "react";

const navClass =
  "px-3 py-2 rounded-lg text-white/90 no-underline hover:bg-white/10 hover:text-white transition-colors block";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex">
      {/* Mobile: overlay when sidebar open */}
      <button
        type="button"
        aria-label="ปิดเมนู"
        onClick={closeSidebar}
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar: drawer on mobile, static on desktop */}
      <aside
        className={`
          w-56 shrink-0 bg-[#2d1b4e] text-white flex flex-col
          fixed md:relative inset-y-0 left-0 z-50
          transform transition-transform duration-200 ease-out
          md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Link
            href="/admin"
            onClick={closeSidebar}
            className="font-bold text-lg text-white no-underline"
          >
            หลังบ้าน
          </Link>
          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={closeSidebar}
            className="md:hidden p-2 -m-2 text-white/80 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 flex flex-col gap-1">
          <Link href="/admin/products" className={navClass} onClick={closeSidebar}>
            จัดการสินค้า
          </Link>
          <Link href="/admin/orders" className={navClass} onClick={closeSidebar}>
            จัดการออเดอร์
          </Link>
          <Link href="/admin/users" className={navClass} onClick={closeSidebar}>
            จัดการผู้ใช้งาน
          </Link>
          <Link href="/admin/contacts" className={navClass} onClick={closeSidebar}>
            จัดการข้อมูลติดต่อ
          </Link>
          <Link href="/admin/about" className={navClass} onClick={closeSidebar}>
            จัดการข้อมูลเกี่ยวกับเรา
          </Link>
          <Link href="/admin/slip-accounts" className={navClass} onClick={closeSidebar}>
            จัดการบัญชีสลิป
          </Link>
        </nav>
        <div className="mt-auto p-4 border-t border-white/10">
          <Link
            href="/"
            onClick={closeSidebar}
            className="text-sm text-white/70 no-underline hover:text-white"
          >
            ← กลับหน้าร้าน
          </Link>
        </div>
      </aside>

      {/* Main: header with hamburger on mobile */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden shrink-0 flex items-center gap-3 px-4 py-3 bg-[#2d1b4e] text-white">
          <button
            type="button"
            aria-label="เปิดเมนู"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -m-2 text-white/90 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-lg">หลังบ้าน</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
