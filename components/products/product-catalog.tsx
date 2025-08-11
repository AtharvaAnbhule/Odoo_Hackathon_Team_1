"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  Grid,
  List,
  Heart,
  Star,
  Calendar,
  Package,
  Users,
  Clock,
} from "lucide-react";
import { DUMMY_PRODUCTS } from "@/lib/data";
import Image from "next/image";

interface ProductCatalogProps {
  onBookProduct?: (productId: string) => void;
}

export function ProductCatalog({ onBookProduct }: ProductCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const categories = [
    "all",
    ...Array.from(new Set(DUMMY_PRODUCTS.map((p) => p.category))),
  ];

  const filteredProducts = DUMMY_PRODUCTS.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesPrice =
      product.basePrice >= priceRange[0] && product.basePrice <= priceRange[1];
    return (
      matchesSearch && matchesCategory && matchesPrice && product.isRentable
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low-high":
        return a.basePrice - b.basePrice;
      case "price-high-low":
        return b.basePrice - a.basePrice;
      case "popularity":
        return b.popularity - a.popularity;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
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

  const ProductCard = ({ product }: { product: any }) => {
    const stockStatus = getStockStatus(product.stock, product.totalStock);

    return (
      <Card className="group hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
        <CardHeader className="p-0 relative">
          <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-t-lg">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              width={400}
              height={225}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
            <Heart className="h-4 w-4" />
          </Button>
          <Badge className={`absolute top-2 left-2 ${stockStatus.color}`}>
            {stockStatus.text}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div>
              <CardTitle className="text-lg line-clamp-1">
                {product.name}
              </CardTitle>
              <CardDescription className="text-sm line-clamp-2 mt-1">
                {product.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm">4.8</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className="capitalize">
              {product.category}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {product.popularity}% popular
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold">₹{product.basePrice}</span>
              <span className="text-sm text-muted-foreground capitalize">
                per {product.unit}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {product.stock}/{product.totalStock} available
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:inline-flex"
                      onClick={() => setSelectedProduct(product)}>
                      Details
                    </Button>
                  </DialogTrigger>
                </Dialog>
                <Button
                  size="sm"
                  disabled={product.stock === 0}
                  onClick={() => onBookProduct?.(product.id)}
                  className="flex-1 sm:flex-initial">
                  <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Book Now</span>
                  <span className="inline sm:hidden">Book</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProductListItem = ({ product }: { product: any }) => {
    const stockStatus = getStockStatus(product.stock, product.totalStock);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative w-32 h-24 flex-shrink-0">
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
              <Badge className={`absolute top-1 left-1 ${stockStatus.color}`}>
                {stockStatus.text}
              </Badge>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <CardTitle className="text-lg truncate">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1 line-clamp-2">
                    {product.description}
                  </CardDescription>
                </div>
                <Button size="sm" variant="ghost" className="ml-2">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="capitalize">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm">4.8</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {product.popularity}% popular
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold">
                    ₹{product.basePrice}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1 capitalize">
                    per {product.unit}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProduct(product)}>
                        Details
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  <Button
                    size="sm"
                    disabled={product.stock === 0}
                    onClick={() => onBookProduct?.(product.id)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl">Browse Products</CardTitle>
          <CardDescription>
            Find the perfect rental for your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="category" className="sr-only">
                  Category
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="capitalize">
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="sort" className="sr-only">
                  Sort By
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="price-low-high">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high-low">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1 w-full">
                <Label>
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={200}
                  min={0}
                  step={10}
                  className="w-full mt-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view">
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  aria-label="List view">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {sortedProducts.length}{" "}
            {sortedProducts.length === 1 ? "Product" : "Products"} Found
          </h2>
          <p className="text-sm text-muted-foreground">
            {selectedCategory !== "all" && `in "${selectedCategory}" • `}
            Showing results for "{searchTerm || "all products"}"
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1.5">
          {sortedProducts.filter((p) => p.stock > 0).length} Available
        </Badge>
      </div>

      {sortedProducts.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
          {sortedProducts.map((product) =>
            viewMode === "grid" ? (
              <ProductCard key={product.id} product={product} />
            ) : (
              <ProductListItem key={product.id} product={product} />
            )
          )}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking
              for
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setPriceRange([0, 200]);
              }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedProduct.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedProduct.description}
                </DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-8 mt-6">
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={selectedProduct.images[0] || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProduct.images
                      .slice(1)
                      .map((image: string, index: number) => (
                        <div
                          key={index}
                          className="aspect-square relative rounded-md overflow-hidden">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${selectedProduct.name} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl font-bold">
                          ₹{selectedProduct.basePrice}
                        </span>
                        <Badge
                          className={
                            getStockStatus(
                              selectedProduct.stock,
                              selectedProduct.totalStock
                            ).color
                          }>
                          {
                            getStockStatus(
                              selectedProduct.stock,
                              selectedProduct.totalStock
                            ).text
                          }
                        </Badge>
                      </div>
                      <p className="text-muted-foreground capitalize">
                        per {selectedProduct.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="font-medium">4.8</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Key Features</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProduct.amenities.map((amenity: string) => (
                        <div
                          key={amenity}
                          className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedProduct.notes && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Special Notes</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedProduct.notes}
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Availability</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Available Units
                          </p>
                          <p className="font-medium">
                            {selectedProduct.stock}/{selectedProduct.totalStock}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Next Available
                          </p>
                          <p className="font-medium">Today</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 flex gap-3">
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={() => onBookProduct?.(selectedProduct.id)}
                      disabled={selectedProduct.stock === 0}>
                      <Calendar className="h-5 w-5 mr-2" />
                      Book Now
                    </Button>
                    <Button variant="outline" size="lg" className="px-3">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
