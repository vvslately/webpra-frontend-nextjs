"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";

type OptionValue = {
  id: number;
  value: string;
  description: string | null;
  price_adjustment: number;
  image_url: string | null;
  display_order: number;
};

type Option = {
  id: number;
  name: string;
  display_order: number;
  values: OptionValue[];
};

type Props = {
  productId: number;
  productName: string;
  price: number;
  image: string | null;
  deliveryLabel: string;
};

export default function ProductDetailClient({
  productId,
  productName,
  price,
  image,
  deliveryLabel,
}: Props) {
  const [qty, setQty] = useState(1);
  const [options, setOptions] = useState<Option[]>([]);
  const [combinations, setCombinations] = useState<Array<{ combination: Record<string, string[]>; price_adjustment: number }>>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [optionsLoading, setOptionsLoading] = useState(true);
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${productId}/options`).then((res) => res.json()),
      fetch(`/api/products/${productId}/combinations`).then((res) => res.json()),
    ])
      .then(([optionsData, combinationsData]) => {
        if (optionsData.options) {
          setOptions(optionsData.options);
          const initial: Record<string, string> = {};
          optionsData.options.forEach((opt: Option) => {
            if (opt.values.length > 0) {
              initial[opt.name] = opt.values[0].value;
            }
          });
          setSelectedOptions(initial);
        }
        if (combinationsData.combinations) {
          setCombinations(combinationsData.combinations);
        }
      })
      .catch(() => {})
      .finally(() => setOptionsLoading(false));
  }, [productId]);

  // คำนวณราคารวมจาก options และ combinations ที่เลือก
  const calculatedPrice = (() => {
    let total = price;
    
    // เพิ่มราคาจาก individual option values
    Object.entries(selectedOptions).forEach(([optionName, selectedValue]) => {
      const option = options.find((opt) => opt.name === optionName);
      if (option && selectedValue) {
        const valueObj = option.values.find((v) => v.value === selectedValue);
        if (valueObj) {
          total += valueObj.price_adjustment || 0;
        }
      }
    });

    // เพิ่มราคาจาก combinations ที่ตรงกับ options ที่เลือก
    combinations.forEach((combo) => {
      const comboMatches = Object.keys(combo.combination).every((optionName) => {
        const comboValues = combo.combination[optionName] || [];
        const selectedValue = selectedOptions[optionName];
        // ตรวจสอบว่า selectedValue อยู่ใน comboValues หรือไม่
        return selectedValue && comboValues.includes(selectedValue);
      });
      if (comboMatches) {
        total += combo.price_adjustment || 0;
      }
    });

    return total;
  })();

  function handleAddToCart() {
    const opts = Object.keys(selectedOptions).length > 0 &&
      Object.values(selectedOptions).some((val) => val && val.length > 0)
      ? selectedOptions
      : undefined;
    addItem({ productId, name: productName, price: calculatedPrice, image, qty, selectedOptions: opts });
    router.push("/cart");
  }

  return (
    <>
      {/* Options */}
      {optionsLoading ? (
        <p className="text-sm text-[#666] my-4">กำลังโหลด options...</p>
      ) : options.length > 0 ? (
        <div className="space-y-4 my-6">
          {options.map((opt) => {
            const selectedValue = selectedOptions[opt.name];
            const selectedValueObj = opt.values.find((val) => val.value === selectedValue);
            return (
              <div key={opt.id}>
                <label className="block text-sm font-medium text-[#333] mb-2">
                  {opt.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((val) => {
                    const isSelected = selectedValue === val.value;
                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => setSelectedOptions((prev) => ({ ...prev, [opt.name]: val.value }))}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center gap-2 ${
                          isSelected
                            ? "border-[#6b5b7a] bg-[#6b5b7a] text-white"
                            : "border-gray-300 bg-white text-[#333] hover:border-[#6b5b7a]/50"
                        }`}
                      >
                        {val.image_url && (
                          <div className="relative w-8 h-8 rounded overflow-hidden shrink-0">
                            <Image
                              src={val.image_url}
                              alt={val.value}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                        )}
                        <span>{val.value}</span>
                        {val.price_adjustment !== 0 && (
                          <span className={`text-xs ${
                            isSelected ? "text-white/80" : "text-[#666]"
                          }`}>
                            {val.price_adjustment > 0 ? "+" : ""}฿{val.price_adjustment.toLocaleString("th-TH")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedValueObj?.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedValueObj.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Price Display */}
      <div className="my-4">
        <p className="text-2xl md:text-3xl font-bold text-[#2d1b4e]">
          ฿{calculatedPrice.toLocaleString("th-TH")}
        </p>
        {calculatedPrice !== price && (
          <p className="text-sm text-[#666] mt-1">
            ราคาพื้นฐาน: ฿{price.toLocaleString("th-TH")}
            {calculatedPrice > price && (
              <span className="text-green-600 ml-1">
                (+฿{(calculatedPrice - price).toLocaleString("th-TH")})
              </span>
            )}
            {calculatedPrice < price && (
              <span className="text-red-600 ml-1">
                (฿{(calculatedPrice - price).toLocaleString("th-TH")})
              </span>
            )}
          </p>
        )}
      </div>

      <div className="w-12 h-0.5 bg-[#6b5b7a] my-4" />
      {/* Shipping badge */}
      <div className="inline-block mt-4 px-4 py-2 rounded-full bg-[#6b5b7a] text-white text-sm font-medium">
        {deliveryLabel}
      </div>
      <div className="w-12 h-0.5 bg-[#6b5b7a] my-6" />
      {/* Quantity + Add to cart */}
      <div className="flex flex-wrap items-center gap-4 mt-6">
        <div className="flex items-stretch rounded-lg overflow-hidden border border-[#6b5b7a]/40 bg-white">
          <button
            type="button"
            onClick={() => setQty((n) => Math.max(1, n - 1))}
            className="w-11 h-11 flex items-center justify-center bg-[#6b5b7a] text-white hover:bg-[#5a4b6a] transition-colors"
            aria-label="ลดจำนวน"
          >
            <span className="text-xl font-medium">−</span>
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-14 text-center text-[#2d1b4e] font-medium border-0 border-x border-[#6b5b7a]/20 bg-white focus:outline-none focus:ring-0"
            aria-label="จำนวน"
          />
          <button
            type="button"
            onClick={() => setQty((n) => n + 1)}
            className="w-11 h-11 flex items-center justify-center bg-[#6b5b7a] text-white hover:bg-[#5a4b6a] transition-colors"
            aria-label="เพิ่มจำนวน"
          >
            <span className="text-xl font-medium">+</span>
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="px-8 py-3 rounded-lg bg-[#6b5b7a] text-white font-medium hover:bg-[#5a4b6a] transition-colors whitespace-nowrap"
        >
          เพิ่มลงในตะกร้าสินค้า
        </button>
      </div>
    </>
  );
}
