"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

type Order = {
  id: number;
  user_id: number | null;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  total: string;
  status: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "รอดำเนินการ",
  paid: "ชำระเงินแล้ว",
  shipped: "จัดส่งแล้ว",
  cancelled: "ยกเลิก",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
        else setError(data.error || "โหลดไม่สำเร็จ");
      })
      .catch(() => setError("โหลดไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(orderId: number, status: string) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "อัปเดตสถานะสำเร็จ",
        confirmButtonColor: "#6b5b7a",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      const data = await res.json();
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: data.error || "อัปเดตไม่สำเร็จ",
        confirmButtonColor: "#6b5b7a",
      });
    }
  }

  async function deleteOrder(orderId: number) {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: `ต้องการลบคำสั่งซื้อ #${orderId} ใช่หรือไม่? ลูกค้าที่ผูกบัญชีจะได้รับเงินคืน`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b5b7a",
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "ลบคำสั่งซื้อสำเร็จ",
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
        <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">จัดการออเดอร์</h1>
        <p className="text-[#666]">กำลังโหลด...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">จัดการออเดอร์</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">จัดการออเดอร์</h1>
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f8f6fa] text-left text-sm font-semibold text-[#2d1b4e]">
                <th className="py-3 px-4 w-16">#</th>
                <th className="py-3 px-4">ลูกค้า</th>
                <th className="py-3 px-4">เบอร์</th>
                <th className="py-3 px-4">ยอดรวม</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4">วันที่</th>
                <th className="py-3 px-4 w-40">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#666]">
                    ยังไม่มีคำสั่งซื้อ
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 font-medium text-[#2d1b4e]">
                      #{o.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#2d1b4e]">
                        {o.first_name} {o.last_name}
                      </span>
                      <p className="text-xs text-[#666] mt-0.5 line-clamp-2 max-w-[200px]">
                        {o.address}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#666]">{o.phone}</td>
                    <td className="py-3 px-4 font-medium text-[#6b5b7a]">
                      ฿{Number(o.total).toLocaleString("th-TH")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          o.status === "shipped"
                            ? "bg-green-100 text-green-800"
                            : o.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : o.status === "paid"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#666]">
                      {new Date(o.created_at).toLocaleDateString("th-TH")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a]"
                        >
                          <option value="pending">รอดำเนินการ</option>
                          <option value="paid">ชำระเงินแล้ว</option>
                          <option value="shipped">จัดส่งแล้ว</option>
                          <option value="cancelled">ยกเลิก</option>
                        </select>
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="text-sm text-[#6b5b7a] hover:underline"
                        >
                          รายละเอียด
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteOrder(o.id)}
                          className="text-sm text-red-600 hover:text-red-700 hover:underline"
                        >
                          ลบ
                        </button>
                      </div>
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
