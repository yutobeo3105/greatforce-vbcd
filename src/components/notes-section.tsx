"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card } from "~/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface NotesSectionProps {
  entityType: string;
  entityId: string;
}

export function NotesSection({ entityType, entityId }: NotesSectionProps) {
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: notes, refetch } = api.note.getByEntity.useQuery({
    entityType,
    entityId,
  });

  const createNote = api.note.create.useMutation({
    onSuccess: () => {
      setContent("");
      void refetch();
    },
  });

  const updateNote = api.note.update.useMutation({
    onSuccess: () => {
      setEditingId(null);
      setEditContent("");
      void refetch();
    },
  });

  const deleteNote = api.note.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleCreate = () => {
    if (content.trim()) {
      createNote.mutate({
        content,
        entityType,
        entityId,
      });
    }
  };

  const handleUpdate = (id: string) => {
    if (editContent.trim()) {
      updateNote.mutate({
        id,
        content: editContent,
      });
    }
  };

  const startEdit = (id: string, currentContent: string) => {
    setEditingId(id);
    setEditContent(currentContent);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Add a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <Button 
          onClick={handleCreate} 
          disabled={!content.trim() || createNote.isPending}
        >
          {createNote.isPending ? "Adding..." : "Add Note"}
        </Button>
      </div>

      <div className="space-y-3">
        {notes?.map((note) => (
          <Card key={note.id} className="p-4">
            {editingId === note.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdate(note.id)}
                    disabled={!editContent.trim() || updateNote.isPending}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      {note.createdAt !== note.updatedAt && " (edited)"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(note.id, note.content)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNote.mutate({ id: note.id })}
                      disabled={deleteNote.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}

        {notes?.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No notes yet. Add one above to get started.
          </p>
        )}
      </div>
    </div>
  );
}
