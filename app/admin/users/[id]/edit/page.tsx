"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  balance: number;
};

export default function AdminUserEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState("user");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/users/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setRole(data.user.role);
          setBalance(String(data.user.balance));
        } else setError(data.error || "โหลดไม่สำเร็จ");
      })
      .catch(() => setError("โหลดไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSaving(true);
    const balanceNum = parseFloat(balance);
    if (Number.isNaN(balanceNum) || balanceNum < 0) {
      setError("ยอดคงเหลือต้องเป็นตัวเลขไม่ติดลบ");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, balance: balanceNum }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "บันทึกไม่สำเร็จ");
        return;
      }
      router.push("/admin/users");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-[#666]">กำลังโหลด...</p>;
  if (error && !user) {
    return (
      <div>
        <p className="text-red-600">{error}</p>
        <Link href="/admin/users" className="text-[#6b5b7a] hover:underline mt-4 inline-block">
          ← กลับรายการผู้ใช้
        </Link>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-[#6b5b7a] hover:underline text-sm font-medium"
        >
          ← กลับรายการผู้ใช้
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">
        แก้ไขผู้ใช้: {user.username}
      </h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-1">ชื่อผู้ใช้</label>
          <p className="text-[#333]">{user.username}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#333] mb-1">อีเมล</label>
          <p className="text-[#333]">{user.email}</p>
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-[#333] mb-1">
            บทบาท
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a]"
          >
            <option value="user">ผู้ใช้</option>
            <option value="admin">แอดมิน</option>
          </select>
        </div>
        <div>
          <label htmlFor="balance" className="block text-sm font-medium text-[#333] mb-1">
            ยอดคงเหลือ (บาท)
          </label>
          <input
            id="balance"
            type="number"
            min="0"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a]"
            required
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-[#6b5b7a] text-white font-medium hover:bg-[#5a4b6a] disabled:opacity-60"
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          <Link
            href="/admin/users"
            className="px-6 py-3 rounded-lg border border-gray-300 text-[#333] font-medium hover:bg-gray-50 no-underline"
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}
