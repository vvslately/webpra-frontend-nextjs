"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

type Contact = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  created_at: string;
};

export default function AdminContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/contacts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.contact) setContact(data.contact);
        else setError(data.error || "โหลดไม่สำเร็จ");
      })
      .catch(() => setError("โหลดไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!contact) return;
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: `ลบข้อความจาก "${contact.name}" ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b5b7a",
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/api/admin/contacts/${contact.id}`, { method: "DELETE" });
    if (res.ok) {
      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "ลบข้อความสำเร็จ",
        confirmButtonColor: "#6b5b7a",
      });
      router.push("/admin/contacts");
      router.refresh();
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

  if (loading) return <p className="text-[#666]">กำลังโหลด...</p>;
  if (error || !contact) {
    return (
      <div>
        <p className="text-red-600">{error || "ไม่พบข้อความติดต่อ"}</p>
        <Link href="/admin/contacts" className="text-[#6b5b7a] hover:underline mt-4 inline-block">
          ← กลับรายการข้อมูลติดต่อ
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/contacts"
          className="text-[#6b5b7a] hover:underline text-sm font-medium"
        >
          ← กลับรายการข้อมูลติดต่อ
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">
        ข้อความติดต่อ #{contact.id}
      </h1>
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8 max-w-2xl">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-[#666] mb-1">ชื่อ</dt>
            <dd className="text-[#2d1b4e] font-medium">{contact.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[#666] mb-1">โทรศัพท์</dt>
            <dd className="text-[#333]">{contact.phone || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[#666] mb-1">อีเมล</dt>
            <dd className="text-[#333]">
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="text-[#6b5b7a] hover:underline">
                  {contact.email}
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[#666] mb-1">วันที่ส่ง</dt>
            <dd className="text-[#333]">
              {new Date(contact.created_at).toLocaleString("th-TH")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[#666] mb-1">ข้อความ</dt>
            <dd className="text-[#333] whitespace-pre-wrap">{contact.message}</dd>
          </div>
        </dl>
        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-600 font-medium hover:bg-red-50 transition-colors"
          >
            ลบข้อความนี้
          </button>
        </div>
      </div>
    </div>
  );
}
