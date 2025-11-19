"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface CustomFieldsSectionProps {
  entityType: string;
  entityId: string;
}

const FIELD_TYPES = [
  { value: "TEXT", label: "Text" },
  { value: "NUMBER", label: "Number" },
  { value: "DATE", label: "Date" },
  { value: "BOOLEAN", label: "Yes/No" },
  { value: "URL", label: "URL" },
  { value: "EMAIL", label: "Email" },
] as const;

export function CustomFieldsSection({ entityType, entityId }: CustomFieldsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newField, setNewField] = useState<{
    name: string;
    fieldType: "TEXT" | "NUMBER" | "DATE" | "BOOLEAN" | "URL" | "EMAIL";
    value: string;
  }>({
    name: "",
    fieldType: "TEXT",
    value: "",
  });
  const [editValue, setEditValue] = useState("");

  const { data: fields, refetch } = api.customField.getByEntity.useQuery({
    entityType,
    entityId,
  });

  const createField = api.customField.create.useMutation({
    onSuccess: () => {
      void refetch();
      setIsAdding(false);
      setNewField({ name: "", fieldType: "TEXT", value: "" });
    },
  });

  const updateField = api.customField.update.useMutation({
    onSuccess: () => {
      void refetch();
      setEditingId(null);
    },
  });

  const deleteField = api.customField.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleCreate = () => {
    if (!newField.name.trim()) return;
    createField.mutate({
      ...newField,
      entityType,
      entityId,
    });
  };

  const handleStartEdit = (fieldId: string, currentValue: string) => {
    setEditingId(fieldId);
    setEditValue(currentValue);
  };

  const handleSaveEdit = (fieldId: string) => {
    updateField.mutate({
      id: fieldId,
      value: editValue,
    });
  };

  const renderFieldValue = (field: { id: string; name: string; fieldType: string; value: string }) => {
    if (editingId === field.id) {
      return (
        <div className="flex items-center gap-2">
          {field.fieldType === "BOOLEAN" ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-8 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          ) : field.fieldType === "DATE" ? (
            <Input
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8 flex-1"
            />
          ) : field.fieldType === "NUMBER" ? (
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8 flex-1"
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8 flex-1"
            />
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSaveEdit(field.id)}
            disabled={updateField.isPending}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingId(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    let displayValue = field.value;
    if (field.fieldType === "BOOLEAN") {
      displayValue = field.value === "true" ? "Yes" : "No";
    } else if (field.fieldType === "URL") {
      return (
        <a href={field.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {field.value}
        </a>
      );
    } else if (field.fieldType === "EMAIL") {
      return (
        <a href={`mailto:${field.value}`} className="text-blue-600 hover:underline">
          {field.value}
        </a>
      );
    }

    return <span>{displayValue}</span>;
  };

  return (
    <div className="space-y-4">
      {fields && fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((field) => (
            <Card key={field.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{field.name}</span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                      {FIELD_TYPES.find((t) => t.value === field.fieldType)?.label}
                    </span>
                  </div>
                  <div className="text-sm">
                    {renderFieldValue(field)}
                  </div>
                </div>
                {editingId !== field.id && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(field.id, field.value)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Delete this custom field?")) {
                          deleteField.mutate({ id: field.id });
                        }
                      }}
                      disabled={deleteField.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {isAdding ? (
        <Card className="p-4">
          <div className="space-y-3">
            <Input
              placeholder="Field name (e.g., LinkedIn Profile)"
              value={newField.name}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
            />
            <Select
              value={newField.fieldType}
              onValueChange={(value) => setNewField({ ...newField, fieldType: value as typeof newField.fieldType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {newField.fieldType === "BOOLEAN" ? (
              <Select
                value={newField.value}
                onValueChange={(value) => setNewField({ ...newField, value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            ) : newField.fieldType === "DATE" ? (
              <Input
                type="date"
                value={newField.value}
                onChange={(e) => setNewField({ ...newField, value: e.target.value })}
              />
            ) : newField.fieldType === "NUMBER" ? (
              <Input
                type="number"
                placeholder="Value"
                value={newField.value}
                onChange={(e) => setNewField({ ...newField, value: e.target.value })}
              />
            ) : (
              <Input
                placeholder="Value"
                value={newField.value}
                onChange={(e) => setNewField({ ...newField, value: e.target.value })}
              />
            )}
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={createField.isPending}>
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => {
                setIsAdding(false);
                setNewField({ name: "", fieldType: "TEXT", value: "" });
              }}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Field
        </Button>
      )}

      {!isAdding && (!fields || fields.length === 0) && (
        <p className="text-center text-sm text-muted-foreground py-4">
          No custom fields yet. Add one above.
        </p>
      )}
    </div>
  );
}
