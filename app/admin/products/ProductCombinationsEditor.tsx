"use client";

import { useState, useEffect } from "react";

type Combination = {
  id?: number;
  combination: Record<string, string[]>; // { "สี": ["แดง"], "ขนาด": ["L"] }
  price_adjustment?: number;
  display_order?: number;
};

type Option = {
  id?: number;
  name: string;
  values: Array<{ id?: number; value: string }>;
};

type Props = {
  productId: number | null;
  options: Option[];
  combinations: Combination[];
  onChange: (combinations: Combination[]) => void;
};

export default function ProductCombinationsEditor({
  productId,
  options,
  combinations,
  onChange,
}: Props) {
  const [localCombinations, setLocalCombinations] = useState<Combination[]>(combinations);

  useEffect(() => {
    setLocalCombinations(combinations);
  }, [combinations]);

  function updateCombination(index: number, updates: Partial<Combination>) {
    const newCombinations = [...localCombinations];
    newCombinations[index] = { ...newCombinations[index], ...updates };
    setLocalCombinations(newCombinations);
    onChange(newCombinations);
  }

  function addCombination() {
    const newCombination: Combination = {
      combination: {},
      price_adjustment: 0,
      display_order: localCombinations.length,
    };
    const newCombinations = [...localCombinations, newCombination];
    setLocalCombinations(newCombinations);
    onChange(newCombinations);
  }

  function removeCombination(index: number) {
    const newCombinations = localCombinations.filter((_, i) => i !== index);
    setLocalCombinations(newCombinations);
    onChange(newCombinations);
  }

  function toggleCombinationValue(comboIdx: number, optionName: string, value: string) {
    const combo = localCombinations[comboIdx];
    const current = combo.combination[optionName] || [];
    const isSelected = current.includes(value);
    const updated = isSelected
      ? current.filter((v) => v !== value)
      : [...current, value];
    const newCombination = {
      ...combo.combination,
      [optionName]: updated.length > 0 ? updated : undefined,
    };
    // Remove empty arrays
    Object.keys(newCombination).forEach((key) => {
      if (Array.isArray(newCombination[key]) && newCombination[key].length === 0) {
        delete newCombination[key];
      }
    });
    updateCombination(comboIdx, { combination: newCombination });
  }

  if (options.length < 2) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          ต้องมีอย่างน้อย 2 options เพื่อสร้าง combination
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#2d1b4e]">Option Combinations</h3>
        <button
          type="button"
          onClick={addCombination}
          className="px-4 py-2 text-sm rounded-lg bg-[#6b5b7a] text-white hover:bg-[#5a4b6a]"
        >
          + เพิ่ม Combination
        </button>
      </div>

      {localCombinations.length === 0 ? (
        <p className="text-sm text-gray-500">ยังไม่มี combination</p>
      ) : (
        <div className="space-y-4">
          {localCombinations.map((combo, comboIdx) => (
            <div key={comboIdx} className="p-4 border border-gray-300 rounded-lg bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-[#333]">Combination #{comboIdx + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeCombination(comboIdx)}
                  className="px-3 py-1 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                >
                  ลบ
                </button>
              </div>

              <div className="space-y-3 mb-3">
                {options.map((opt) => (
                  <div key={opt.id || opt.name}>
                    <label className="block text-sm font-medium text-[#333] mb-1">
                      {opt.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val) => {
                        const selectedValues = combo.combination[opt.name] || [];
                        const isSelected = selectedValues.includes(val.value);
                        return (
                          <label
                            key={val.id || val.value}
                            className={`px-3 py-1.5 rounded-lg border-2 cursor-pointer text-sm ${
                              isSelected
                                ? "border-[#6b5b7a] bg-[#6b5b7a] text-white"
                                : "border-gray-300 bg-white text-[#333] hover:border-[#6b5b7a]/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCombinationValue(comboIdx, opt.name, val.value)}
                              className="sr-only"
                            />
                            {val.value}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">
                  การปรับราคา (฿)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={combo.price_adjustment ?? 0}
                  onChange={(e) =>
                    updateCombination(comboIdx, {
                      price_adjustment: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-[#333] text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5b7a]"
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
