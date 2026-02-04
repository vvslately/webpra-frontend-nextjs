"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductOptionsEditor from "./ProductOptionsEditor";
import ProductCombinationsEditor from "./ProductCombinationsEditor";

type ProductFormData = {
  name: string;
  subtitle: string;
  image: string;
  price: string;
  delivery_method: string;
};

type OptionValue = {
  id?: number;
  value: string;
  description?: string | null;
  price_adjustment?: number;
  image_url?: string | null;
  display_order?: number;
};

type Option = {
  id?: number;
  name: string;
  display_order?: number;
  values: OptionValue[];
};

type Props = {
  product?: ProductFormData & { id: number };
  mode: "new" | "edit";
};

export default function ProductForm({ product, mode }: Props) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [subtitle, setSubtitle] = useState(product?.subtitle ?? "");
  const [image, setImage] = useState(product?.image ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [delivery_method, setDeliveryMethod] = useState(product?.delivery_method ?? "");
  const [options, setOptions] = useState<Option[]>([]);
  const [combinations, setCombinations] = useState<Array<{ combination: Record<string, string[]>; price_adjustment: number }>>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [combinationsLoading, setCombinationsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (mode === "edit" && product?.id) {
      setOptionsLoading(true);
      fetch(`/api/admin/products/${product.id}/options`)
        .then((res) => res.json())
        .then((data) => {
          if (data.options) {
            setOptions(data.options);
          }
        })
        .catch(() => {})
        .finally(() => setOptionsLoading(false));

      setCombinationsLoading(true);
      fetch(`/api/admin/products/${product.id}/combinations`)
        .then((res) => res.json())
        .then((data) => {
          if (data.combinations) {
            setCombinations(data.combinations);
          }
        })
        .catch(() => {})
        .finally(() => setCombinationsLoading(false));
    }
  }, [mode, product?.id]);

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
        setImage(data.url);
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
    const priceNum = parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError("กรุณากรอกราคาที่ถูกต้อง");
      setLoading(false);
      return;
    }
    try {
      const body = {
        name: name.trim(),
        subtitle: subtitle.trim() || null,
        image: image.trim() || null,
        price: priceNum,
        delivery_method: delivery_method.trim() || null,
      };
      const url = mode === "edit" ? `/api/admin/products/${product!.id}` : "/api/admin/products";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      const productId = mode === "edit" ? product!.id : data.id;
      if (productId) {
        const validOptions = options
          .filter((opt) => opt.name.trim())
          .map((opt, idx) => ({
            name: opt.name.trim(),
            display_order: idx,
            values: opt.values
              .filter((v) => v.value.trim())
              .map((v, vidx) => ({
                value: v.value.trim(),
                description: v.description || null,
                price_adjustment: v.price_adjustment || 0,
                image_url: v.image_url || null,
                display_order: vidx,
              })),
          }));

        if (validOptions.length > 0) {
          await fetch(`/api/admin/products/${productId}/options`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ options: validOptions }),
          });
        }

        // Save combinations
        const validCombinations = combinations
          .filter((c) => c.combination && Object.keys(c.combination).length > 0)
          .map((c, idx) => ({
            combination: c.combination,
            price_adjustment: c.price_adjustment || 0,
            display_order: idx,
          }));

        await fetch(`/api/admin/products/${productId}/combinations`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ combinations: validCombinations }),
        });
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[#333] mb-1">
          ชื่อสินค้า <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent"
          required
        />
      </div>
      <div>
        <label htmlFor="subtitle" className="block text-sm font-medium text-[#333] mb-1">
          คำบรรยายสั้น
        </label>
        <input
          id="subtitle"
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-[#333] mb-1">
          รูปภาพ (ใส่ URL หรืออัพโหลดรูป)
        </label>
        <input
          id="image"
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
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
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-[#333] mb-1">
          ราคา (บาท) <span className="text-red-500">*</span>
        </label>
        <input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent"
          required
        />
      </div>
      <div>
        <label htmlFor="delivery_method" className="block text-sm font-medium text-[#333] mb-1">
          วิธีจัดส่ง
        </label>
        <input
          id="delivery_method"
          type="text"
          value={delivery_method}
          onChange={(e) => setDeliveryMethod(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] focus:border-transparent"
          placeholder="เช่น ส่งฟรี, ส่งด่วน"
        />
      </div>
      <div>
        {optionsLoading ? (
          <p className="text-sm text-[#666]">กำลังโหลด options...</p>
        ) : (
          <ProductOptionsEditor
            productId={mode === "edit" ? product?.id ?? null : null}
            options={options}
            onChange={setOptions}
          />
        )}
      </div>
      <div>
        {combinationsLoading ? (
          <p className="text-sm text-[#666]">กำลังโหลด combinations...</p>
        ) : (
          <ProductCombinationsEditor
            productId={mode === "edit" ? product?.id ?? null : null}
            options={options}
            combinations={combinations}
            onChange={setCombinations}
          />
        )}
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
          {loading ? "กำลังบันทึก..." : mode === "edit" ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
        </button>
        <Link
          href="/admin/products"
          className="px-6 py-3 rounded-lg border border-gray-300 text-[#333] font-medium hover:bg-gray-50 transition-colors no-underline"
        >
          ยกเลิก
        </Link>
      </div>
    </form>
  );
}
