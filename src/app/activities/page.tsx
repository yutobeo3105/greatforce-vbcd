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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Plus,
  CheckCircle,
  Circle,
  Calendar,
  User,
  TrendingUp,
  Trash2,
  Pencil,
  Clock,
} from "lucide-react";

export default function ActivitiesPage() {
  const [open, setOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "overdue">("all");

  const { data: allActivities, refetch: refetchAll } = api.activity.getAll.useQuery();
  const { data: upcomingActivities, refetch: refetchUpcoming } = api.activity.getUpcoming.useQuery();
  const { data: overdueActivities, refetch: refetchOverdue } = api.activity.getOverdue.useQuery();
  const { data: contacts } = api.contact.getAll.useQuery();
  const { data: deals } = api.deal.getAll.useQuery();

  const createActivity = api.activity.create.useMutation({
    onSuccess: () => {
      void refetchAll();
      void refetchUpcoming();
      void refetchOverdue();
      setOpen(false);
    },
  });

  const updateActivity = api.activity.update.useMutation({
    onSuccess: () => {
      void refetchAll();
      void refetchUpcoming();
      void refetchOverdue();
      setOpen(false);
      setEditingActivity(null);
    },
  });

  const deleteActivity = api.activity.delete.useMutation({
    onSuccess: () => {
      void refetchAll();
      void refetchUpcoming();
      void refetchOverdue();
    },
  });

  const toggleComplete = api.activity.toggleComplete.useMutation({
    onSuccess: () => {
      void refetchAll();
      void refetchUpcoming();
      void refetchOverdue();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      type: formData.get("type") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      dueDate: formData.get("dueDate")
        ? new Date(formData.get("dueDate") as string)
        : undefined,
      contactId: formData.get("contactId") as string,
      dealId: formData.get("dealId") as string,
    };

    if (editingActivity) {
      updateActivity.mutate({ id: editingActivity.id, ...data });
    } else {
      createActivity.mutate(data);
    }
  };

  const getActivities = () => {
    switch (filter) {
      case "upcoming":
        return upcomingActivities ?? [];
      case "overdue":
        return overdueActivities ?? [];
      default:
        return allActivities ?? [];
    }
  };

  const activities = getActivities();

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Activities</h1>
            <p className="text-sm text-muted-foreground hidden md:block">
              Manage your tasks and activities
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingActivity(null);
                }}
                size="sm"
                className="md:h-10"
              >
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Add Activity</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingActivity ? "Edit Activity" : "Add New Activity"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    name="type"
                    defaultValue={editingActivity?.type ?? "Task"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Task">Task</SelectItem>
                      <SelectItem value="Call">Call</SelectItem>
                      <SelectItem value="Meeting">Meeting</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingActivity?.title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={editingActivity?.description ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="datetime-local"
                    defaultValue={
                      editingActivity?.dueDate
                        ? new Date(editingActivity.dueDate)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactId">Contact</Label>
                    <Select
                      name="contactId"
                      defaultValue={editingActivity?.contactId ?? undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts?.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.firstName} {contact.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealId">Deal</Label>
                    <Select
                      name="dealId"
                      defaultValue={editingActivity?.dealId ?? undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select deal (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {deals?.map((deal) => (
                          <SelectItem key={deal.id} value={deal.id}>
                            {deal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setEditingActivity(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingActivity ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="mb-6" onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">
              All ({allActivities?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingActivities?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue ({overdueActivities?.length ?? 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {activities.map((activity) => {
            const isOverdue =
              !activity.completed &&
              activity.dueDate &&
              new Date(activity.dueDate) < new Date();

            return (
              <Card
                key={activity.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="mt-1"
                      onClick={() => {
                        toggleComplete.mutate({
                          id: activity.id,
                          completed: !activity.completed,
                        });
                      }}
                    >
                      {activity.completed ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3
                            className={`font-semibold ${
                              activity.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {activity.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{activity.type}</Badge>
                            {isOverdue && (
                              <Badge variant="destructive">
                                <Clock className="h-3 w-3 mr-1" />
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Edit"
                            onClick={() => {
                              setEditingActivity(activity);
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
                              if (confirm("Delete this activity?")) {
                                deleteActivity.mutate({ id: activity.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {activity.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(activity.dueDate).toLocaleString()}
                          </div>
                        )}
                        {activity.contact && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {activity.contact.firstName}{" "}
                            {activity.contact.lastName}
                          </div>
                        )}
                        {activity.deal && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {activity.deal.title}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No activities found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
