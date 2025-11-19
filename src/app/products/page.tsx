"use client";

import { useState } from "react";
import { AppLayout } from "~/components/app-layout";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Plus, Package, Edit2, Trash2, DollarSign, Search } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export default function ProductsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    description: "",
    price: 0,
    cost: 0,
    category: "",
    isActive: true,
  });

  const { data: products, refetch } = api.product.getAll.useQuery({
    search: searchQuery || undefined,
    category: categoryFilter,
  });

  const { data: categories } = api.product.getCategories.useQuery();

  const createProduct = api.product.create.useMutation({
    onSuccess: () => {
      void refetch();
      setIsCreating(false);
      setNewProduct({
        name: "",
        sku: "",
        description: "",
        price: 0,
        cost: 0,
        category: "",
        isActive: true,
      });
    },
  });

  const updateProduct = api.product.update.useMutation({
    onSuccess: () => {
      void refetch();
      setEditingProduct(null);
    },
  });

  const deleteProduct = api.product.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleCreate = () => {
    if (!newProduct.name || !newProduct.sku) return;
    createProduct.mutate(newProduct);
  };

  const productToEdit = products?.find((p) => p.id === editingProduct);

  const calculateMargin = (price: number, cost: number) => {
    if (price === 0) return 0;
    return ((price - cost) / price) * 100;
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Products</h2>
            <p className="text-muted-foreground">Manage your product catalog and pricing</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products?.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {product.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
                    <div className="flex gap-2 mt-2">
                      {product.category && (
                        <Badge variant="secondary">{product.category}</Badge>
                      )}
                      {!product.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {product.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="font-semibold">${product.price.toFixed(2)}</span>
                  </div>
                  {product.cost && product.cost > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cost:</span>
                        <span className="text-sm">${product.cost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Margin:</span>
                        <span className="text-sm font-medium text-green-600">
                          {calculateMargin(product.price, product.cost).toFixed(1)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingProduct(product.id)}
                    className="flex-1"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Delete this product?")) {
                        deleteProduct.mutate({ id: product.id });
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

        {products?.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter
                ? "Try adjusting your filters"
                : "Create your first product to get started"}
            </p>
            {!searchQuery && !categoryFilter && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Product
              </Button>
            )}
          </div>
        )}

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Product Name *</label>
                  <Input
                    placeholder="e.g., Premium Widget"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">SKU *</label>
                  <Input
                    placeholder="e.g., WIDGET-001"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Product description..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Cost</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Input
                    placeholder="e.g., Hardware"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createProduct.isPending}>
                  Create Product
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            {productToEdit && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Product Name</label>
                    <Input
                      value={productToEdit.name}
                      onChange={(e) => {
                        updateProduct.mutate({
                          id: productToEdit.id,
                          name: e.target.value,
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">SKU</label>
                    <Input
                      value={productToEdit.sku ?? ""}
                      onChange={(e) => {
                        updateProduct.mutate({
                          id: productToEdit.id,
                          sku: e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={productToEdit.description ?? ""}
                    onChange={(e) => {
                      updateProduct.mutate({
                        id: productToEdit.id,
                        description: e.target.value,
                      });
                    }}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={productToEdit.price}
                      onChange={(e) => {
                        updateProduct.mutate({
                          id: productToEdit.id,
                          price: parseFloat(e.target.value) || 0,
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cost</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={productToEdit.cost ?? 0}
                      onChange={(e) => {
                        updateProduct.mutate({
                          id: productToEdit.id,
                          cost: parseFloat(e.target.value) || 0,
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Input
                      value={productToEdit.category ?? ""}
                      onChange={(e) => {
                        updateProduct.mutate({
                          id: productToEdit.id,
                          category: e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={productToEdit.isActive}
                    onChange={(e) => {
                      updateProduct.mutate({
                        id: productToEdit.id,
                        isActive: e.target.checked,
                      });
                    }}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active
                  </label>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
