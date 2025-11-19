"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent } from "~/components/ui/card";
import { MessageSquare, Trash2, Edit2, AtSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommentsSectionProps {
  entityType: "CONTACT" | "COMPANY" | "DEAL" | "ACTIVITY";
  entityId: string;
}

export function CommentsSection({ entityType, entityId }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: comments, refetch } = api.comment.getByEntity.useQuery({
    entityType,
    entityId,
  });

  const createComment = api.comment.create.useMutation({
    onSuccess: () => {
      void refetch();
      setNewComment("");
    },
  });

  const updateComment = api.comment.update.useMutation({
    onSuccess: () => {
      void refetch();
      setEditingId(null);
      setEditContent("");
    },
  });

  const deleteComment = api.comment.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleCreate = () => {
    if (!newComment.trim()) return;

    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(newComment)) !== null) {
      mentions.push(match[1]!);
    }

    createComment.mutate({
      content: newComment,
      entityType,
      entityId,
      mentions,
    });
  };

  const handleUpdate = (id: string) => {
    if (!editContent.trim()) return;

    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(editContent)) !== null) {
      mentions.push(match[1]!);
    }

    updateComment.mutate({
      id,
      content: editContent,
      mentions,
    });
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span key={index} className="text-blue-600 font-medium">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Comments</span>
        </div>
        <Textarea
          placeholder="Write a comment... Use @username to mention someone"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <Button onClick={handleCreate} disabled={createComment.isPending || !newComment.trim()}>
          Add Comment
        </Button>
      </div>

      <div className="space-y-3">
        {comments?.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-4">
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(comment.id)}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">System User</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Delete this comment?")) {
                            deleteComment.mutate({ id: comment.id });
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{renderContent(comment.content)}</p>
                  {comment.mentions && comment.mentions.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <AtSign className="h-3 w-3" />
                      <span>Mentioned: {comment.mentions}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {comments?.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No comments yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Be the first to comment on this {entityType.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
}
