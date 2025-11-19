"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { X, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface TagsSectionProps {
  entityType: string;
  entityId: string;
}

const TAG_COLORS = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#eab308", label: "Yellow" },
  { value: "#84cc16", label: "Lime" },
  { value: "#10b981", label: "Green" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#d946ef", label: "Fuchsia" },
  { value: "#ec4899", label: "Pink" },
  { value: "#64748b", label: "Slate" },
];

export function TagsSection({ entityType, entityId }: TagsSectionProps) {
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [showInput, setShowInput] = useState(false);

  const { data: tags, refetch } = api.tag.getByEntity.useQuery({
    entityType,
    entityId,
  });

  const { data: existingTags } = api.tag.getUniqueTags.useQuery({
    entityType,
  });

  const createTag = api.tag.create.useMutation({
    onSuccess: () => {
      setNewTagName("");
      setShowInput(false);
      void refetch();
    },
  });

  const deleteTag = api.tag.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleCreate = () => {
    if (newTagName.trim()) {
      createTag.mutate({
        name: newTagName.trim(),
        color: selectedColor,
        entityType,
        entityId,
      });
    }
  };

  const handleQuickAdd = (tagName: string, tagColor?: string) => {
    createTag.mutate({
      name: tagName,
      color: tagColor ?? selectedColor,
      entityType,
      entityId,
    });
  };

  const suggestedTags = existingTags?.filter(
    (existingTag) => !tags?.some((tag) => tag.name === existingTag.name)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags?.map((tag) => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.color ?? "#3b82f6" }}
            className="flex items-center gap-1 pl-3 pr-2 py-1"
          >
            <span className="text-white">{tag.name}</span>
            <button
              onClick={() => deleteTag.mutate({ id: tag.id })}
              className="ml-1 text-white hover:text-gray-200"
              disabled={deleteTag.isPending}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {!showInput && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInput(true)}
            className="h-7"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Tag
          </Button>
        )}
      </div>

      {showInput && (
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Tag name..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                } else if (e.key === "Escape") {
                  setShowInput(false);
                  setNewTagName("");
                }
              }}
              autoFocus
            />
          </div>
          <Select value={selectedColor} onValueChange={setSelectedColor}>
            <SelectTrigger className="w-[120px]">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: selectedColor }}
                />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {TAG_COLORS.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color.value }}
                    />
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!newTagName.trim() || createTag.isPending}
          >
            Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowInput(false);
              setNewTagName("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {suggestedTags && suggestedTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Suggested tags:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.slice(0, 10).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-secondary"
                onClick={() => handleQuickAdd(tag.name, tag.color ?? undefined)}
              >
                <span style={{ color: tag.color ?? "#3b82f6" }}>{tag.name}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {tags?.length === 0 && !showInput && (
        <p className="text-sm text-muted-foreground">No tags yet. Add one above to get started.</p>
      )}
    </div>
  );
}
