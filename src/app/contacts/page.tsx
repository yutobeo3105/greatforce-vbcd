"use client";

import { useState } from "react";
import { AppLayout } from "~/components/app-layout";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Plus, Mail, Phone, Building2, Trash2, Pencil } from "lucide-react";
import Link from "next/link";

export default function ContactsPage() {
  const [open, setOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: contacts, refetch } = api.contact.getAll.useQuery({
    search: searchTerm || undefined,
  });
  const { data: companies } = api.company.getAll.useQuery();

  const createContact = api.contact.create.useMutation({
    onSuccess: () => {
      void refetch();
      setOpen(false);
    },
  });

  const updateContact = api.contact.update.useMutation({
    onSuccess: () => {
      void refetch();
      setOpen(false);
      setEditingContact(null);
    },
  });

  const deleteContact = api.contact.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      title: formData.get("title") as string,
      companyId: formData.get("companyId") as string,
      tags: formData.get("tags") as string,
      notes: formData.get("notes") as string,
    };

    if (editingContact) {
      updateContact.mutate({ id: editingContact, ...data });
    } else {
      createContact.mutate(data);
    }
  };

  const currentContact = editingContact
    ? contacts?.find((c) => c.id === editingContact)
    : null;

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground">
              Manage your contacts and relationships
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingContact(null);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingContact ? "Edit Contact" : "Add New Contact"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={currentContact?.firstName}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={currentContact?.lastName}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={currentContact?.email}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={currentContact?.phone ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={currentContact?.title ?? ""}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyId">Company</Label>
                  <Select
                    name="companyId"
                    defaultValue={currentContact?.companyId ?? undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="lead, customer, partner"
                    defaultValue={currentContact?.tags ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    defaultValue={currentContact?.notes ?? ""}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setEditingContact(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingContact ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts?.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <Link href={`/contacts/${contact.id}`} className="flex items-center gap-3 flex-1 cursor-pointer">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                      {contact.firstName[0]}
                      {contact.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold hover:underline">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      {contact.title && (
                        <p className="text-sm text-muted-foreground">
                          {contact.title}
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Edit"
                      onClick={() => {
                        setEditingContact(contact.id);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete"
                      onClick={() => {
                        if (confirm("Delete this contact?")) {
                          deleteContact.mutate({ id: contact.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{contact.email}</span>
                  </div>
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
                </div>
                {contact.tags && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {contact.tags.split(",").map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {contacts?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No contacts found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
