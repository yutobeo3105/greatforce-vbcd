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
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Plus, DollarSign, Calendar, Building2, User, Trash2, Pencil } from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

const STAGE_COLORS: Record<string, { bg: string; border: string; text: string; badge: string; header: string }> = {
  "Lead": {
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    text: "text-slate-600 dark:text-slate-400",
    badge: "bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30",
    header: "bg-gradient-to-br from-slate-500/20 to-slate-600/20 border-slate-500/40"
  },
  "Qualified": {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
    header: "bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/40"
  },
  "Proposal": {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-600 dark:text-purple-400",
    badge: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
    header: "bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/40"
  },
  "Negotiation": {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
    header: "bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/40"
  },
  "Closed Won": {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-600 dark:text-green-400",
    badge: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30",
    header: "bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/40"
  },
  "Closed Lost": {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-600 dark:text-red-400",
    badge: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
    header: "bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/40"
  }
};

function DroppableColumn({ stage, children }: { stage: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const colors = STAGE_COLORS[stage];

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[400px] p-2 rounded-lg transition-colors ${
        isOver 
          ? `${colors?.bg} border-2 ${colors?.border} border-dashed` 
          : 'bg-muted/30'
      }`}
    >
      {children}
    </div>
  );
}

function DealCard({ deal, onEdit, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3 cursor-move hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-sm">{deal.title}</h4>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              aria-label="Edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(deal);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              aria-label="Delete"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this deal?")) {
                  onDelete(deal.id);
                }
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm font-semibold text-primary">
            <DollarSign className="h-3 w-3" />
            {formatCurrency(deal.value)}
          </div>
          {deal.company && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              {deal.company.name}
            </div>
          )}
          {deal.contact && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {deal.contact.firstName} {deal.contact.lastName}
            </div>
          )}
          {deal.expectedCloseDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(deal.expectedCloseDate).toLocaleDateString()}
            </div>
          )}
        </div>
        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            {deal.probability}% probability
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DealsPage() {
  const [open, setOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [activeDeal, setActiveDeal] = useState<any>(null);

  const { data: dealsByStage, refetch } = api.deal.getByStage.useQuery();
  const { data: contacts } = api.contact.getAll.useQuery();
  const { data: companies } = api.company.getAll.useQuery();

  const createDeal = api.deal.create.useMutation({
    onSuccess: () => {
      void refetch();
      setOpen(false);
    },
  });

  const updateDeal = api.deal.update.useMutation({
    onSuccess: () => {
      void refetch();
      setOpen(false);
      setEditingDeal(null);
    },
  });

  const deleteDeal = api.deal.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const deal = dealsByStage
      ?.flatMap((s) => s.deals)
      .find((d) => d.id === event.active.id);
    setActiveDeal(deal);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    let newStage: string | undefined;

    if (STAGES.includes(over.id as string)) {
      newStage = over.id as string;
    } else {
      const targetDeal = dealsByStage
        ?.flatMap((s) => s.deals)
        .find((d) => d.id === over.id);
      newStage = targetDeal?.stage;
    }

    if (!newStage) return;

    const currentDeal = dealsByStage
      ?.flatMap((s) => s.deals)
      .find((d) => d.id === dealId);

    if (currentDeal?.stage !== newStage) {
      updateDeal.mutate({ id: dealId, stage: newStage });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      value: parseFloat(formData.get("value") as string),
      stage: formData.get("stage") as string,
      probability: parseInt(formData.get("probability") as string),
      contactId: formData.get("contactId") as string,
      companyId: formData.get("companyId") as string,
      expectedCloseDate: formData.get("expectedCloseDate")
        ? new Date(formData.get("expectedCloseDate") as string)
        : undefined,
      description: formData.get("description") as string,
    };

    if (editingDeal) {
      updateDeal.mutate({ id: editingDeal.id, ...data });
    } else {
      createDeal.mutate(data);
    }
  };

  const getTotalValue = (stage: string) => {
    const stageDeals = dealsByStage?.find((s) => s.stage === stage)?.deals ?? [];
    return stageDeals.reduce((sum, deal) => sum + deal.value, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Deals Pipeline</h1>
            <p className="text-sm text-muted-foreground hidden md:block">
              Drag deals between stages to update their status
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingDeal(null);
                }}
                size="sm"
                className="md:h-10"
              >
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Add Deal</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingDeal ? "Edit Deal" : "Add New Deal"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Deal Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingDeal?.title}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      name="value"
                      type="number"
                      step="0.01"
                      defaultValue={editingDeal?.value}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probability">Probability (%)</Label>
                    <Input
                      id="probability"
                      name="probability"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={editingDeal?.probability ?? 0}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage">Stage</Label>
                  <Select
                    name="stage"
                    defaultValue={editingDeal?.stage ?? "Lead"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactId">Contact</Label>
                    <Select
                      name="contactId"
                      defaultValue={editingDeal?.contactId ?? undefined}
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
                    <Label htmlFor="companyId">Company</Label>
                    <Select
                      name="companyId"
                      defaultValue={editingDeal?.companyId ?? undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company (optional)" />
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                  <Input
                    id="expectedCloseDate"
                    name="expectedCloseDate"
                    type="date"
                    defaultValue={
                      editingDeal?.expectedCloseDate
                        ? new Date(editingDeal.expectedCloseDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={editingDeal?.description ?? ""}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setEditingDeal(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingDeal ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto">
            {STAGES.map((stage) => {
              const stageDeals =
                dealsByStage?.find((s) => s.stage === stage)?.deals ?? [];
              const colors = STAGE_COLORS[stage];
              
              return (
                <div key={stage} className="flex flex-col">
                  <Card className={`mb-2 border-2 ${colors?.header}`}>
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold text-sm ${colors?.text}`}>{stage}</h3>
                        <Badge className={colors?.badge}>{stageDeals.length}</Badge>
                      </div>
                      <p className={`text-xs ${colors?.text} font-medium`}>
                        {formatCurrency(getTotalValue(stage))}
                      </p>
                    </CardHeader>
                  </Card>
                  <SortableContext
                    id={stage}
                    items={stageDeals.map((d) => d.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableColumn stage={stage}>
                      {stageDeals.map((deal) => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          onEdit={(deal: any) => {
                            setEditingDeal(deal);
                            setOpen(true);
                          }}
                          onDelete={(id: string) => {
                            deleteDeal.mutate({ id });
                          }}
                        />
                      ))}
                    </DroppableColumn>
                  </SortableContext>
                </div>
              );
            })}
          </div>
          <DragOverlay>
            {activeDeal ? (
              <Card className="cursor-move opacity-90">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm">{activeDeal.title}</h4>
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary mt-2">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(activeDeal.value)}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </AppLayout>
  );
}
