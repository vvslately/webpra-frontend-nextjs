"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Order = {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  total: string;
  status: string;
  created_at: string;
};

type OrderItem = {
  id: number;
  product_name: string;
  product_image: string | null;
  price: string;
  qty: number;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "รอดำเนินการ",
  paid: "ชำระเงินแล้ว",
  shipped: "จัดส่งแล้ว",
  cancelled: "ยกเลิก",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          setItems(data.items ?? []);
        } else setError(data.error || "โหลดไม่สำเร็จ");
      })
      .catch(() => setError("โหลดไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    if (!order) return;
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setOrder((prev) => (prev ? { ...prev, status } : null));
    else {
      const data = await res.json();
      alert(data.error || "อัปเดตไม่สำเร็จ");
    }
  }

  async function deleteOrder() {
    if (!order) return;
    if (!confirm("ต้องการลบคำสั่งซื้อ #" + order.id + " ใช่หรือไม่? ลูกค้าที่ผูกบัญชีจะได้รับเงินคืน")) return;
    const res = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/orders");
    } else {
      const data = await res.json();
      alert(data.error || "ลบไม่สำเร็จ");
    }
  }

  if (loading) return <p className="text-[#666]">กำลังโหลด...</p>;
  if (error || !order) {
    return (
      <div>
        <p className="text-red-600">{error || "ไม่พบคำสั่งซื้อ"}</p>
        <Link href="/admin/orders" className="text-[#6b5b7a] hover:underline mt-4 inline-block">
          ← กลับรายการออเดอร์
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-[#6b5b7a] hover:underline text-sm font-medium"
        >
          ← กลับรายการออเดอร์
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">
        คำสั่งซื้อ #{order.id}
      </h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2d1b4e] mb-4">ข้อมูลลูกค้า</h2>
          <p className="text-[#333]">
            <span className="font-medium">{order.first_name} {order.last_name}</span>
          </p>
          <p className="text-sm text-[#666] mt-1">เบอร์: {order.phone}</p>
          <p className="text-sm text-[#666] mt-2 whitespace-pre-wrap">{order.address}</p>
          <p className="text-sm text-[#666] mt-2">
            วันที่สั่ง: {new Date(order.created_at).toLocaleString("th-TH")}
          </p>
          <div className="mt-4">
            <label className="block text-sm font-medium text-[#333] mb-2">สถานะ</label>
            <select
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a]"
            >
              <option value="pending">รอดำเนินการ</option>
              <option value="paid">ชำระเงินแล้ว</option>
              <option value="shipped">จัดส่งแล้ว</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={deleteOrder}
              className="text-sm text-red-600 hover:text-red-700 hover:underline"
            >
              ลบออเดอร์
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2d1b4e] mb-4">รายการสินค้า</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-[#333]">
                  {item.product_name} x {item.qty}
                </span>
                <span className="font-medium text-[#6b5b7a]">
                  ฿{(Number(item.price) * item.qty).toLocaleString("th-TH")}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg font-bold text-[#2d1b4e]">
            ยอดรวม: ฿{Number(order.total).toLocaleString("th-TH")}
          </p>
        </div>
      </div>
    </div>
  );
}
