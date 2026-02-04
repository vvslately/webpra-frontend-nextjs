"use client";

import Swal from "sweetalert2";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: number;
  productName: string;
}) {
  async function handleDelete() {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: `ลบสินค้า "${productName}" ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b5b7a",
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "ลบสินค้าสำเร็จ",
        confirmButtonColor: "#6b5b7a",
      });
      window.location.reload();
    } else {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ลบไม่สำเร็จ",
        confirmButtonColor: "#6b5b7a",
      });
    }
  }
  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-red-600 hover:underline text-sm font-medium"
    >
      ลบ
    </button>
  );
}
