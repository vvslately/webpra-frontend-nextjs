"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ส่งข้อความไม่สำเร็จ");
        return;
      }
      setSuccess(data.message || "บันทึกข้อความติดต่อเรียบร้อย");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          name="name"
          placeholder="ชื่อ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent"
          aria-label="ชื่อ"
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="โทรศัพท์"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent"
          aria-label="โทรศัพท์"
        />
        <input
          type="email"
          name="email"
          placeholder="ที่อยู่อีเมลของคุณ"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent"
          aria-label="ที่อยู่อีเมลของคุณ"
        />
      </div>
      <textarea
        name="message"
        placeholder="ข้อความ"
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent resize-y"
        aria-label="ข้อความ"
        required
      />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-600" role="status">
          {success}
        </p>
      )}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-lg bg-[#6b5b7a] text-white font-bold hover:bg-[#5a4a69] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:ring-offset-2 transition-colors"
        >
          {loading ? "กำลังส่ง..." : "ติดต่อเรา"}
        </button>
      </div>
    </form>
  );
}
