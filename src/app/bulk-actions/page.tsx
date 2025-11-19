"use client";

import { useState } from "react";
import { AppLayout } from "~/components/app-layout";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Mail, Phone, Building2 } from "lucide-react";
import { BulkActionsBar, SelectableCard } from "~/components/bulk-actions";
import { useToast } from "~/hooks/use-toast";
import { Input } from "~/components/ui/input";

export default function BulkActionsPage() {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: contacts, refetch } = api.contact.getAll.useQuery({
    search: searchTerm || undefined,
  });

  const bulkDelete = api.bulkAction.bulkDeleteContacts.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Bulk Delete Complete",
        description: `Successfully deleted ${data.deleted} contacts`,
      });
      setSelectedIds([]);
      void refetch();
    },
    onError: (error) => {
      toast({
        title: "Bulk Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkUpdateStatus = api.bulkAction.bulkUpdateContactStatus.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Bulk Update Complete",
        description: `Successfully updated ${data.updated} contacts`,
      });
      setSelectedIds([]);
      void refetch();
    },
    onError: (error) => {
      toast({
        title: "Bulk Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    }
  };

  const handleSelectAll = () => {
    if (contacts && selectedIds.length < contacts.length) {
      setSelectedIds(contacts.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} contacts?`)) {
      bulkDelete.mutate({ ids: selectedIds });
    }
  };

  const handleUpdateStatus = (status: string) => {
    bulkUpdateStatus.mutate({
      ids: selectedIds,
      status: status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
    });
  };

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Bulk Actions Demo</h1>
          <p className="text-muted-foreground">
            Select multiple contacts to perform bulk operations
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          {contacts && contacts.length > 0 && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.length === contacts.length}
                onChange={handleSelectAll}
                className="h-4 w-4"
              />
              <span className="text-sm text-muted-foreground">
                Select all ({contacts.length} contacts)
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts?.map((contact) => (
            <SelectableCard
              key={contact.id}
              id={contact.id}
              selected={selectedIds.includes(contact.id)}
              onSelect={handleSelect}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {contact.firstName} {contact.lastName}
                  </CardTitle>
                  <Badge
                    variant={
                      contact.status === "ACTIVE"
                        ? "default"
                        : contact.status === "INACTIVE"
                        ? "secondary"
                        : "outline"
                    }
                    className="w-fit"
                  >
                    {contact.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.company.name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </SelectableCard>
          ))}
        </div>

        {!contacts || contacts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No contacts found
          </div>
        )}

        <BulkActionsBar
          selectedIds={selectedIds}
          onClearSelection={() => setSelectedIds([])}
          onDelete={handleDelete}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </AppLayout>
  );
}
