"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Checkbox } from "~/components/ui/checkbox";
import { Trash2, CheckCircle, XCircle, Archive } from "lucide-react";

interface BulkActionsBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onDelete?: () => void;
  onUpdateStatus?: (status: string) => void;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
  }>;
}

export function BulkActionsBar({
  selectedIds,
  onClearSelection,
  onDelete,
  onUpdateStatus,
  actions = [],
}: BulkActionsBarProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
      <span className="font-medium">
        {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
      </span>

      <div className="flex gap-2">
        {onDelete && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}

        {onUpdateStatus && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary">
                Update Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onUpdateStatus("ACTIVE")}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus("INACTIVE")}>
                <XCircle className="h-4 w-4 mr-2" />
                Inactive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus("ARCHIVED")}>
                <Archive className="h-4 w-4 mr-2" />
                Archived
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {actions.map((action, idx) => (
          <Button
            key={idx}
            size="sm"
            variant={action.variant === "destructive" ? "destructive" : "secondary"}
            onClick={action.onClick}
            className="gap-2"
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={onClearSelection}
        className="text-primary-foreground hover:text-primary-foreground/80"
      >
        Clear
      </Button>
    </div>
  );
}

interface SelectableCardProps {
  id: string;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  children: React.ReactNode;
}

export function SelectableCard({
  id,
  selected,
  onSelect,
  children,
}: SelectableCardProps) {
  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(id, checked as boolean)}
        />
      </div>
      <div className={selected ? "ring-2 ring-primary rounded-lg" : ""}>
        {children}
      </div>
    </div>
  );
}
