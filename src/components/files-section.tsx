"use client";

import { useState, useRef } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Upload, File, FileText, Image, Video, Music, Trash2, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FilesSectionProps {
  entityType: string;
  entityId: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <Image className="h-8 w-8" />;
  if (mimeType.startsWith("video/")) return <Video className="h-8 w-8" />;
  if (mimeType.startsWith("audio/")) return <Music className="h-8 w-8" />;
  if (mimeType.includes("pdf")) return <FileText className="h-8 w-8" />;
  return <File className="h-8 w-8" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

export function FilesSection({ entityType, entityId }: FilesSectionProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: files, refetch } = api.file.getByEntity.useQuery({
    entityType,
    entityId,
  });

  const deleteFile = api.file.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", entityType);
    formData.append("entityId", entityId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        void refetch();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert("Failed to upload file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button
            asChild
            disabled={uploading}
            className="cursor-pointer"
          >
            <span>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload File"}
            </span>
          </Button>
        </label>
      </div>

      {files && files.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                  {file.mimeType.startsWith("image/") ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="max-h-32 w-full object-contain"
                    />
                  ) : (
                    getFileIcon(file.mimeType)
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    asChild
                  >
                    <a href={file.url} download={file.name}>
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Delete this file?")) {
                        deleteFile.mutate({ id: file.id });
                      }
                    }}
                    disabled={deleteFile.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-8">
          No files yet. Upload one above to get started.
        </p>
      )}
    </div>
  );
}
