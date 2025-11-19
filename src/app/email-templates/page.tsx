"use client";

import { useState } from "react";
import { AppLayout } from "~/components/app-layout";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Plus, Mail, Edit2, Trash2, Eye } from "lucide-react";
import { Badge } from "~/components/ui/badge";

export default function EmailTemplatesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    body: "",
    category: "",
  });
  const [previewVars, setPreviewVars] = useState({
    firstName: "John",
    lastName: "Doe",
    company: "Acme Corp",
    email: "john@example.com",
  });

  const { data: templates, refetch } = api.emailTemplate.getAll.useQuery();

  const createTemplate = api.emailTemplate.create.useMutation({
    onSuccess: () => {
      void refetch();
      setIsCreating(false);
      setNewTemplate({ name: "", subject: "", body: "", category: "" });
    },
  });

  const updateTemplate = api.emailTemplate.update.useMutation({
    onSuccess: () => {
      void refetch();
      setEditingTemplate(null);
    },
  });

  const deleteTemplate = api.emailTemplate.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const { data: preview } = api.emailTemplate.preview.useQuery(
    {
      templateId: previewTemplate!,
      variables: previewVars,
    },
    { enabled: !!previewTemplate }
  );

  const handleCreate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) return;
    createTemplate.mutate(newTemplate);
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/{{([^}]+)}}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, "")))];
  };

  const templateToEdit = templates?.find((t) => t.id === editingTemplate);
  const allVariables = templateToEdit
    ? extractVariables(templateToEdit.subject + " " + templateToEdit.body)
    : [];

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Email Templates</h2>
            <p className="text-muted-foreground">Create and manage email templates with variables</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {template.name}
                    </CardTitle>
                    {template.category && (
                      <Badge variant="secondary" className="mt-2">
                        {template.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Subject:</strong> {template.subject}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewTemplate(template.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTemplate(template.id)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Delete this template?")) {
                        deleteTemplate.mutate({ id: template.id });
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates?.length === 0 && (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No email templates yet</h3>
            <p className="text-muted-foreground mb-4">Create your first template to get started</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>
        )}

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Template Name</label>
                <Input
                  placeholder="e.g., Welcome Email"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category (Optional)</label>
                <Input
                  placeholder="e.g., Onboarding, Follow-up"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  placeholder="Use {{firstName}}, {{company}}, etc."
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Body</label>
                <Textarea
                  placeholder="Hi {{firstName}}, welcome to {{company}}..."
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                  rows={10}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createTemplate.isPending}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Email Template</DialogTitle>
            </DialogHeader>
            {templateToEdit && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Template Name</label>
                  <Input
                    value={templateToEdit.name}
                    onChange={(e) => {
                      updateTemplate.mutate({
                        id: templateToEdit.id,
                        name: e.target.value,
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Input
                    value={templateToEdit.category ?? ""}
                    onChange={(e) => {
                      updateTemplate.mutate({
                        id: templateToEdit.id,
                        category: e.target.value,
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    value={templateToEdit.subject}
                    onChange={(e) => {
                      updateTemplate.mutate({
                        id: templateToEdit.id,
                        subject: e.target.value,
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Body</label>
                  <Textarea
                    value={templateToEdit.body}
                    onChange={(e) => {
                      updateTemplate.mutate({
                        id: templateToEdit.id,
                        body: e.target.value,
                      });
                    }}
                    rows={10}
                  />
                </div>
                {allVariables.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Available Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {allVariables.map((v) => (
                        <Badge key={v} variant="outline">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Preview Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Test Variables:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(previewVars).map(([key, value]) => (
                    <Input
                      key={key}
                      placeholder={key}
                      value={value}
                      onChange={(e) => setPreviewVars({ ...previewVars, [key]: e.target.value })}
                    />
                  ))}
                </div>
              </div>
              {preview && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">Subject:</p>
                    <p className="p-3 bg-muted rounded">{preview.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Body:</p>
                    <div className="p-4 bg-muted rounded whitespace-pre-wrap">
                      {preview.body}
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
