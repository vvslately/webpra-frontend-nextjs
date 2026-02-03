"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  balance: number;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (data.users) setUsers(data.users);
        else setError(data.error || "โหลดไม่สำเร็จ");
      })
      .catch(() => setError("โหลดไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">จัดการผู้ใช้งาน</h1>
        <p className="text-[#666]">กำลังโหลด...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">จัดการผู้ใช้งาน</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">จัดการผู้ใช้งาน</h1>
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f8f6fa] text-left text-sm font-semibold text-[#2d1b4e]">
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">ชื่อผู้ใช้</th>
                <th className="py-3 px-4">อีเมล</th>
                <th className="py-3 px-4 w-24 text-center">บทบาท</th>
                <th className="py-3 px-4 w-28 text-right">ยอดคงเหลือ</th>
                <th className="py-3 px-4 w-24 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#666]">
                    ยังไม่มีผู้ใช้งาน
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 font-medium text-[#2d1b4e]">{u.id}</td>
                    <td className="py-3 px-4">{u.username}</td>
                    <td className="py-3 px-4 text-sm text-[#666]">{u.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {u.role === "admin" ? "แอดมิน" : "ผู้ใช้"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[#6b5b7a]">
                      ฿{u.balance.toLocaleString("th-TH")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/admin/users/${u.id}/edit`}
                        className="text-sm text-[#6b5b7a] hover:underline font-medium"
                      >
                        แก้ไข
                      </Link>
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
