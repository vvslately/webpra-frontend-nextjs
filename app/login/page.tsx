"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#2d1b4e] text-center mb-6">
          เข้าสู่ระบบ
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login" className="block text-sm font-medium text-[#333] mb-1">
              ชื่อผู้ใช้ หรือ อีเมล
            </label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent"
              placeholder="username หรือ email"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#333] mb-1">
              รหัสผ่าน
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent"
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#2d1b4e] text-white font-medium hover:bg-[#3d2b5e] disabled:opacity-60 transition-colors"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[#666]">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="text-[#6b5b7a] hover:underline font-medium">
            สมัครสมาชิก
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-[#666]">
          <Link href="/" className="text-[#6b5b7a] hover:underline">
            กลับหน้าแรก
          </Link>
        </p>
      </div>
    </div>
  );
}
