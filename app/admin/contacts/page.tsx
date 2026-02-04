"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

type Contact = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  created_at: string;
};

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/contacts")
      .then((r) => r.json())
      .then((data) => {
        if (data.contacts) setContacts(data.contacts);
        else setError(data.error || "โหลดไม่สำเร็จ");
      })
      .catch(() => setError("โหลดไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, name: string) {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: `ลบข้อความจาก "${name}" ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b5b7a",
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "ลบข้อความสำเร็จ",
        confirmButtonColor: "#6b5b7a",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      const data = await res.json();
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: data.error || "ลบไม่สำเร็จ",
        confirmButtonColor: "#6b5b7a",
      });
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">จัดการข้อมูลติดต่อ</h1>
        <p className="text-[#666]">กำลังโหลด...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">จัดการข้อมูลติดต่อ</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">จัดการข้อมูลติดต่อ</h1>
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f8f6fa] text-left text-sm font-semibold text-[#2d1b4e]">
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">ชื่อ</th>
                <th className="py-3 px-4">โทรศัพท์</th>
                <th className="py-3 px-4">อีเมล</th>
                <th className="py-3 px-4 max-w-[200px]">ข้อความ</th>
                <th className="py-3 px-4 w-28">วันที่</th>
                <th className="py-3 px-4 w-24 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#666]">
                    ยังไม่มีข้อความติดต่อ
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 font-medium text-[#2d1b4e]">{c.id}</td>
                    <td className="py-3 px-4">{c.name}</td>
                    <td className="py-3 px-4 text-sm text-[#666]">{c.phone || "-"}</td>
                    <td className="py-3 px-4 text-sm text-[#666]">{c.email || "-"}</td>
                    <td className="py-3 px-4 text-sm text-[#666] line-clamp-2 max-w-[200px]">
                      {c.message}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#666]">
                      {new Date(c.created_at).toLocaleDateString("th-TH")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/admin/contacts/${c.id}`}
                        className="text-sm text-[#6b5b7a] hover:underline font-medium mr-2"
                      >
                        ดู
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.name)}
                        className="text-sm text-red-600 hover:underline font-medium"
                      >
                        ลบ
                      </button>
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
