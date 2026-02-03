"use client";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: number;
  productName: string;
}) {
  async function handleDelete() {
    if (!confirm(`ลบสินค้า "${productName}" ใช่หรือไม่?`)) return;
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    if (res.ok) window.location.reload();
    else alert("ลบไม่สำเร็จ");
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
