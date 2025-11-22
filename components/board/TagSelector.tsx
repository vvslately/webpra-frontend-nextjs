"use client";

import { useState, useEffect } from "react";
import { PostTag } from "@/lib/api";
import { apiClient } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, X, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/components/board/Alert";

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
  className?: string;
  disabled?: boolean;
}

export default function TagSelector({
  selectedTagIds,
  onChange,
  className,
  disabled = false,
}: TagSelectorProps) {
  const [tags, setTags] = useState<PostTag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTags, setSelectedTags] = useState<PostTag[]>([]);
  const { showAlert, AlertComponent } = useAlert();

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getTags({ 
          search: searchQuery || undefined,
          limit: 50 
        });
        if (response.status === "success" && response.data) {
          setTags(response.data.tags || []);
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchTags();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Load selected tags details
  useEffect(() => {
    const loadSelectedTags = async () => {
      if (selectedTagIds.length === 0) {
        setSelectedTags([]);
        return;
      }

      try {
        // Get all tags and filter selected ones
        const response = await apiClient.getTags({ limit: 100 });
        if (response.status === "success" && response.data) {
          const selected = response.data.tags.filter((tag) =>
            selectedTagIds.includes(tag.id)
          );
          setSelectedTags(selected);
        }
      } catch (err) {
        console.error("Error loading selected tags:", err);
      }
    };

    loadSelectedTags();
  }, [selectedTagIds]);

  const handleTagToggle = (tag: PostTag) => {
    if (disabled) return;

    const isSelected = selectedTagIds.includes(tag.id);
    if (isSelected) {
      onChange(selectedTagIds.filter((id) => id !== tag.id));
    } else {
      onChange([...selectedTagIds, tag.id]);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    if (disabled) return;
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const filteredTags = tags.filter(
    (tag) =>
      !selectedTagIds.includes(tag.id) &&
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if search query doesn't match any existing tag
  const canCreateNewTag = 
    searchQuery.trim().length > 0 &&
    !tags.some((tag) => tag.name.toLowerCase() === searchQuery.toLowerCase().trim());

  const handleCreateTag = async () => {
    if (!searchQuery.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const response = await apiClient.createTag({
        name: searchQuery.trim(),
        description: null,
      });
      
      if (response.status === "success" && response.data) {
        const newTag = response.data.tag;
        // Add new tag to selected tags
        onChange([...selectedTagIds, newTag.id]);
        // Clear search query
        setSearchQuery("");
        // Refresh tags list
        const tagsResponse = await apiClient.getTags({ limit: 50 });
        if (tagsResponse.status === "success" && tagsResponse.data) {
          setTags(tagsResponse.data.tags || []);
        }
        showAlert({
          title: "สำเร็จ",
          description: `สร้างแท็ก "${newTag.name}" เรียบร้อยแล้ว`,
        });
      }
    } catch (err) {
      showAlert({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้างแท็ก",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label>แท็ก (เลือกได้หลายแท็ก)</Label>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/30">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm"
            >
              <Tag className="h-3 w-3" />
              {tag.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      {!disabled && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ค้นหาแท็ก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={disabled}
          />
        </div>
      )}

      {/* Available Tags */}
      {!disabled && (
        <div className="max-h-48 overflow-y-auto rounded-lg border p-3 space-y-2">
          {isLoading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              กำลังโหลด...
            </div>
          ) : filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{tag.name}</span>
                {tag.description && (
                  <span className="text-xs text-muted-foreground ml-auto truncate max-w-xs">
                    {tag.description}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "ไม่พบแท็กที่ค้นหา" : "ยังไม่มีแท็ก"}
              </p>
              {canCreateNewTag && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={isCreating}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {isCreating ? "กำลังสร้าง..." : `สร้างแท็ก "${searchQuery.trim()}"`}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {selectedTagIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          เลือกแล้ว {selectedTagIds.length} แท็ก
        </p>
      )}

      <AlertComponent />
    </div>
  );
}

