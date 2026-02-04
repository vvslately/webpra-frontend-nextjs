"use client";

import { useState } from "react";
import Image from "next/image";

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
  productId: number | null;
  options: Option[];
  onChange: (options: Option[]) => void;
};

export default function ProductOptionsEditor({ productId, options, onChange }: Props) {
  const [uploadingFor, setUploadingFor] = useState<{ optionIdx: number; valueIdx: number } | null>(null);

  function updateOption(index: number, updates: Partial<Option>) {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onChange(newOptions);
  }

  function updateValue(optionIdx: number, valueIdx: number, updates: Partial<OptionValue>) {
    const newOptions = [...options];
    const newValues = [...newOptions[optionIdx].values];
    newValues[valueIdx] = { ...newValues[valueIdx], ...updates };
    newOptions[optionIdx] = { ...newOptions[optionIdx], values: newValues };
    onChange(newOptions);
  }

  function addOption() {
    onChange([...options, { name: "", values: [] }]);
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  function addValue(optionIdx: number) {
    const newOptions = [...options];
    newOptions[optionIdx].values = [...newOptions[optionIdx].values, { value: "", image_url: null, price_adjustment: 0 }];
    onChange(newOptions);
  }

  function removeValue(optionIdx: number, valueIdx: number) {
    const newOptions = [...options];
    newOptions[optionIdx].values = newOptions[optionIdx].values.filter((_, i) => i !== valueIdx);
    onChange(newOptions);
  }

  async function handleUploadImage(optionIdx: number, valueIdx: number, file: File) {
    setUploadingFor({ optionIdx, valueIdx });
    try {
      const form = new FormData();
      form.append("source", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        updateValue(optionIdx, valueIdx, { image_url: data.url });
      }
    } catch {
      // ignore
    } finally {
      setUploadingFor(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[#333]">
          Options (สี, ขนาด, ฯลฯ)
        </label>
        <button
          type="button"
          onClick={addOption}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-[#333] hover:bg-gray-50"
        >
          + เพิ่ม Option
        </button>
      </div>

      {options.map((option, optionIdx) => (
        <div key={optionIdx} className="p-4 border border-gray-300 rounded-lg bg-gray-50 w-full">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={option.name}
              onChange={(e) => updateOption(optionIdx, { name: e.target.value })}
              placeholder="ชื่อ option เช่น สี, ขนาด"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-[#333] text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5b7a]"
            />
            <button
              type="button"
              onClick={() => removeOption(optionIdx)}
              className="px-3 py-2 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
            >
              ลบ
            </button>
          </div>
          <div className="space-y-2">
            {option.values.map((val, valueIdx) => (
              <div key={valueIdx} className="p-3 bg-white rounded border border-gray-200 space-y-2 w-full">
                <div className="flex items-start gap-2 flex-wrap">
                  <input
                    type="text"
                    value={val.value}
                    onChange={(e) => updateValue(optionIdx, valueIdx, { value: e.target.value })}
                    placeholder="ค่าของ option เช่น แดง, S"
                    className="flex-1 min-w-[150px] px-3 py-2 rounded-lg border border-gray-300 bg-white text-[#333] text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5b7a]"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={val.price_adjustment ?? 0}
                    onChange={(e) => updateValue(optionIdx, valueIdx, { price_adjustment: parseFloat(e.target.value) || 0 })}
                    placeholder="ปรับราคา"
                    className="w-28 px-3 py-2 rounded-lg border border-gray-300 bg-white text-[#333] text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5b7a]"
                  />
                  <input
                    type="url"
                    value={val.image_url || ""}
                    onChange={(e) => updateValue(optionIdx, valueIdx, { image_url: e.target.value })}
                    placeholder="URL รูป"
                    className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-gray-300 bg-white text-[#333] text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5b7a]"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`upload-${optionIdx}-${valueIdx}`}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadImage(optionIdx, valueIdx, f);
                    }}
                  />
                  <label
                    htmlFor={`upload-${optionIdx}-${valueIdx}`}
                    className={`px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-[#333] cursor-pointer hover:bg-gray-50 shrink-0 ${
                      uploadingFor?.optionIdx === optionIdx && uploadingFor?.valueIdx === valueIdx
                        ? "opacity-60"
                        : ""
                    }`}
                  >
                    {uploadingFor?.optionIdx === optionIdx && uploadingFor?.valueIdx === valueIdx
                      ? "อัพโหลด..."
                      : "อัพโหลด"}
                  </label>
                  {val.image_url && (
                    <div className="relative w-12 h-12 rounded border border-gray-200 overflow-hidden shrink-0">
                      <Image src={val.image_url} alt={val.value} fill className="object-cover" sizes="48px" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeValue(optionIdx, valueIdx)}
                    className="px-2 py-2 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 shrink-0"
                  >
                    ×
                  </button>
                </div>
                <textarea
                  value={val.description || ""}
                  onChange={(e) => updateValue(optionIdx, valueIdx, { description: e.target.value })}
                  placeholder="คำบรรยายค่าของ option (ไม่บังคับ)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-[#333] text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5b7a] resize-y"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addValue(optionIdx)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-[#333] hover:bg-gray-50"
            >
              + เพิ่มค่า
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
