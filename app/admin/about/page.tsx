"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";

const PLACEHOLDER_IMAGE =
  "https://files.cdn-files-a.com/admin/system_photos_stock/2000_696430659d148.jpg";

export default function AdminAboutPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/about");
        const data = await res.json();
        if (res.ok) {
          setImageUrl(data.image_url || "");
          setContent(data.content || "");
        }
      } catch {
        setError("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setFetchLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleUploadImage() {
    if (!uploadFile) return;
    setUploadError("");
    setUploadLoading(true);
    try {
      const form = new FormData();
      form.append("source", uploadFile);
      const res = await fetch("/api/upload-image", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "อัพโหลดล้มเหลว");
        return;
      }
      if (data.url) {
        setImageUrl(data.url);
        setUploadFile(null);
      }
    } catch {
      setUploadError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl.trim() || null,
          content: content.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }
      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "บันทึกข้อมูลสำเร็จ",
        confirmButtonColor: "#6b5b7a",
      });
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  if (fetchLoading) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-[#333] mb-6">จัดการข้อมูลเกี่ยวกับเรา</h1>
        <p className="text-[#666]">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[#333] mb-6">จัดการข้อมูลเกี่ยวกับเรา</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-[#333] mb-1">
            รูปภาพ (ใส่ URL หรืออัพโหลดรูป)
          </label>
          <input
            id="image_url"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent"
            placeholder="https://..."
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="image-upload"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setUploadFile(f ?? null);
                setUploadError("");
              }}
            />
            <label
              htmlFor="image-upload"
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-[#333] text-sm font-medium cursor-pointer hover:bg-gray-50"
            >
              เลือกไฟล์
            </label>
            {uploadFile && (
              <>
                <span className="text-sm text-[#666] truncate max-w-[180px]">
                  {uploadFile.name}
                </span>
                <button
                  type="button"
                  onClick={handleUploadImage}
                  disabled={uploadLoading}
                  className="px-4 py-2 rounded-lg bg-[#6b5b7a] text-white text-sm font-medium hover:bg-[#5a4b6a] disabled:opacity-60"
                >
                  {uploadLoading ? "กำลังอัพโหลด..." : "อัพโหลดรูป"}
                </button>
              </>
            )}
          </div>
          {uploadError && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {uploadError}
            </p>
          )}
          {imageUrl && (
            <div className="mt-3 relative w-full max-w-md aspect-[4/3] rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={imageUrl}
                alt="ตัวอย่างรูปภาพ"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-[#333] mb-1">
            ข้อความเกี่ยวกับเรา
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent resize-y"
            placeholder="กรอกข้อความเกี่ยวกับเรา..."
          />
          <p className="mt-1 text-xs text-[#666]">
            ใช้ \n\n สำหรับขึ้นบรรทัดใหม่ (เว้นบรรทัด)
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-[#6b5b7a] text-white font-medium hover:bg-[#5a4b6a] disabled:opacity-60 transition-colors"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
          <Link
            href="/admin"
            className="px-6 py-3 rounded-lg border border-gray-300 text-[#333] font-medium hover:bg-gray-50 transition-colors no-underline"
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}
