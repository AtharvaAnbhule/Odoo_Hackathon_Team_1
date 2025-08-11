"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react";
import { DUMMY_PRODUCTS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = [
    "all",
    ...Array.from(new Set(DUMMY_PRODUCTS.map((p) => p.category))),
  ];

  const filteredProducts = DUMMY_PRODUCTS.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock: number, totalStock: number) => {
    const ratio = stock / totalStock;
    if (ratio > 0.7)
      return { color: "bg-green-100 text-green-800", text: "In Stock" };
    if (ratio > 0.3)
      return { color: "bg-yellow-100 text-yellow-800", text: "Limited" };
    if (ratio > 0)
      return { color: "bg-red-100 text-red-800", text: "Low Stock" };
    return { color: "bg-gray-100 text-gray-800", text: "Out of Stock" };
  };

  const handleDeleteProduct = (productId: string) => {
    toast({
      title: "Product Deleted",
      description: "Product has been removed from inventory",
    });
  };

  const ProductDetailsModal = ({ product }: { product: Product }) => (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{product.name}</DialogTitle>
        <DialogDescription>Product ID: {product.id}</DialogDescription>
      </DialogHeader>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Basic Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Category:</strong> {product.category}
              </div>
              <div>
                <strong>Base Price:</strong> ₹{product.basePrice} per{" "}
                {product.unit}
              </div>
              <div>
                <strong>Stock:</strong> {product.stock}/{product.totalStock}
              </div>
              <div>
                <strong>Condition:</strong> {product.condition}
              </div>
              <div>
                <strong>Location:</strong> {product.location}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-1">
              {product.amenities.map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Performance</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Popularity:</strong> {product.popularity}%
              </div>
              <div>
                <strong>Rating:</strong> {product.rating}/5 (
                {product.reviewCount} reviews)
              </div>
              <div>
                <strong>Last Maintenance:</strong>{" "}
                {product.lastMaintenance
                  ? new Date(product.lastMaintenance).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
          </div>

          {product.specifications && (
            <div>
              <h4 className="font-semibold mb-2">Specifications</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {value}
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.notes && (
            <div>
              <h4 className="font-semibold mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{product.notes}</p>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Product Management</h1>
            <p className="text-muted-foreground">
              Manage your rental inventory and product catalog
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Products ({filteredProducts.length})
            </CardTitle>
            <CardDescription>Manage your product inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Popularity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(
                    product.stock,
                    product.totalStock
                  );
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        ₹{product.basePrice}/{product.unit}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {product.stock}/{product.totalStock}
                          </div>
                          <Badge
                            className={stockStatus.color}
                            variant="secondary">
                            {stockStatus.text}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.isRentable ? "default" : "secondary"
                          }>
                          {product.isRentable ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.popularity}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedProduct(product)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {selectedProduct && (
                              <ProductDetailsModal product={selectedProduct} />
                            )}
                          </Dialog>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
