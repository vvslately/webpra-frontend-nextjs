import Link from "next/link";
import ProductForm from "../ProductForm";

export default function AdminProductsNewPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="text-[#6b5b7a] hover:underline text-sm font-medium"
        >
          ← กลับรายการสินค้า
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-[#2d1b4e] mb-6">เพิ่มสินค้า</h1>
      <ProductForm mode="new" />
    </div>
  );
}
