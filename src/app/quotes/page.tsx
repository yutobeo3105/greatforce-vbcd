"use client";

import { useState } from "react";
import { AppLayout } from "~/components/app-layout";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Plus, FileText, Edit2, Trash2, Eye, Package } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

const STATUS_COLORS: Record<"DRAFT" | "SENT" | "ACCEPTED" | "REJECTED", "secondary" | "default" | "destructive"> = {
  DRAFT: "secondary",
  SENT: "default",
  ACCEPTED: "default",
  REJECTED: "destructive",
};

export default function QuotesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | undefined>();
  const [newQuote, setNewQuote] = useState({
    quoteNumber: "",
    title: "",
    notes: "",
    terms: "",
  });
  const [newItem, setNewItem] = useState({
    productId: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
  });

  const { data: quotes, refetch } = api.quote.getAll.useQuery({
    status: statusFilter,
  });

  const { data: products } = api.product.getAll.useQuery();

  const createQuote = api.quote.create.useMutation({
    onSuccess: () => {
      void refetch();
      setIsCreating(false);
      setNewQuote({
        quoteNumber: "",
        title: "",
        notes: "",
        terms: "",
      });
    },
  });

  const updateQuote = api.quote.update.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const deleteQuote = api.quote.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const addItem = api.quote.addItem.useMutation({
    onSuccess: () => {
      void refetch();
      setAddingItem(null);
      setNewItem({
        productId: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
      });
    },
  });

  const deleteItem = api.quote.deleteItem.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleCreate = () => {
    if (!newQuote.quoteNumber || !newQuote.title) return;
    createQuote.mutate(newQuote);
  };

  const handleAddItem = () => {
    if (!addingItem || !newItem.productId) return;
    addItem.mutate({
      quoteId: addingItem,
      ...newItem,
    });
  };

  const viewingQuoteData = quotes?.find((q) => q.id === viewingQuote) as any;

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Quotes</h2>
            <p className="text-muted-foreground">Manage quotes and proposals</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </div>

        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quotes?.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {quote.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">#{quote.quoteNumber}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={STATUS_COLORS[quote.status as keyof typeof STATUS_COLORS]}>
                        {quote.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="font-semibold">${quote.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Items:</span>
                    <span className="text-sm">{(quote as any).items?.length ?? 0}</span>
                  </div>
                  {(quote as any).contact && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Contact:</span>
                      <span className="text-sm">{(quote as any).contact.name}</span>
                    </div>
                  )}
                  {quote.validUntil && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Valid Until:</span>
                      <span className="text-sm">
                        {new Date(quote.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingQuote(quote.id)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Delete this quote?")) {
                        deleteQuote.mutate({ id: quote.id });
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

        {quotes?.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No quotes found</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter
                ? "Try adjusting your filters"
                : "Create your first quote to get started"}
            </p>
            {!statusFilter && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Quote
              </Button>
            )}
          </div>
        )}

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Quote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quote Number *</label>
                  <Input
                    placeholder="e.g., Q-2024-001"
                    value={newQuote.quoteNumber}
                    onChange={(e) => setNewQuote({ ...newQuote, quoteNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Title *</label>
                  <Input
                    placeholder="e.g., Website Development"
                    value={newQuote.title}
                    onChange={(e) => setNewQuote({ ...newQuote, title: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Textarea
                  placeholder="Internal notes..."
                  value={newQuote.notes}
                  onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Terms & Conditions</label>
                <Textarea
                  placeholder="Payment terms, delivery conditions..."
                  value={newQuote.terms}
                  onChange={(e) => setNewQuote({ ...newQuote, terms: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createQuote.isPending}>
                  Create Quote
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!viewingQuote} onOpenChange={() => setViewingQuote(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Quote Details</DialogTitle>
            </DialogHeader>
            {viewingQuoteData && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quote Number</p>
                    <p className="font-medium">#{viewingQuoteData.quoteNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{viewingQuoteData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={STATUS_COLORS[viewingQuoteData.status as keyof typeof STATUS_COLORS]}>
                      {viewingQuoteData.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-semibold text-lg">${viewingQuoteData.total.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Line Items</h3>
                    <Button size="sm" onClick={() => setAddingItem(viewingQuoteData.id)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {viewingQuoteData.items.map((item: any) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{item.product.name}</span>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {item.quantity} × ${item.unitPrice.toFixed(2)}
                                {item.discount > 0 && ` - $${item.discount.toFixed(2)} discount`}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-semibold">${item.total.toFixed(2)}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm("Remove this item?")) {
                                    deleteItem.mutate({ id: item.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {viewingQuoteData.items.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No items added yet</p>
                    </div>
                  )}
                </div>

                {viewingQuoteData.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{viewingQuoteData.notes}</p>
                  </div>
                )}

                {viewingQuoteData.terms && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Terms & Conditions</p>
                    <p className="text-sm whitespace-pre-wrap">{viewingQuoteData.terms}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Select
                    value={viewingQuoteData.status}
                    onValueChange={(status) => {
                      updateQuote.mutate({
                        id: viewingQuoteData.id,
                        status: status as "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED",
                      });
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!addingItem} onOpenChange={() => setAddingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Line Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Product *</label>
                <Select
                  value={newItem.productId}
                  onValueChange={(value) => {
                    const product = products?.find((p) => p.id === value);
                    setNewItem({
                      ...newItem,
                      productId: value,
                      unitPrice: product?.price ?? 0,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - ${product.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Unit Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Discount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newItem.discount}
                    onChange={(e) => setNewItem({ ...newItem, discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="font-medium">${(newItem.quantity * newItem.unitPrice).toFixed(2)}</span>
                </div>
                {newItem.discount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Discount:</span>
                    <span>-${newItem.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>${(newItem.quantity * newItem.unitPrice - newItem.discount).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAddingItem(null)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem} disabled={addItem.isPending}>
                  Add Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
