"use client";

import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
  onCategoryChange: (categoryId: string | undefined) => void;
  totalCount?: number;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  totalCount,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange(undefined)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-colors",
          !selectedCategory
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        ทั้งหมด
        {totalCount !== undefined && (
          <span className="ml-2 text-xs opacity-70">({totalCount})</span>
        )}
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            selectedCategory === category.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {category.name}
          {category.postCount !== undefined && (
            <span className="ml-2 text-xs opacity-70">({category.postCount})</span>
          )}
        </button>
      ))}
    </div>
  );
}

