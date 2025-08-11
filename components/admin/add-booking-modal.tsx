"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarIcon, User, Package, Plus, Minus } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { DUMMY_PRODUCTS, DUMMY_USERS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@/lib/types";

interface AddBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingAdded: (booking: Booking) => void;
}

export function AddBookingModal({
  open,
  onOpenChange,
  onBookingAdded,
}: AddBookingModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    productId: "",
    startDate: new Date(),
    endDate: addDays(new Date(), 1),
    quantity: 1,
    notes: "",
    pickupLocation: "Main Store",
    returnLocation: "Main Store",
  });

  const selectedProduct = DUMMY_PRODUCTS.find(
    (p) => p.id === formData.productId
  );
  const selectedCustomer = DUMMY_USERS.find(
    (u) => u.id === formData.customerId
  );

  const calculatePricing = () => {
    if (!selectedProduct)
      return {
        days: 0,
        baseAmount: 0,
        discountAmount: 0,
        taxAmount: 0,
        totalPrice: 0,
        securityDeposit: 0,
      };

    const days = Math.max(
      1,
      differenceInDays(formData.endDate, formData.startDate)
    );
    const baseAmount = selectedProduct.basePrice * formData.quantity * days;
    const discountAmount = baseAmount * 0.1;
    const taxAmount = (baseAmount - discountAmount) * 0.09;
    const totalPrice = baseAmount - discountAmount + taxAmount;
    const securityDeposit = selectedProduct.basePrice * formData.quantity * 0.5;

    return {
      days,
      baseAmount,
      discountAmount,
      taxAmount,
      totalPrice,
      securityDeposit,
    };
  };

  const pricing = calculatePricing();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedCustomer) return;

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newBooking: Booking = {
        id: `BK${Date.now()}`,
        customerId: formData.customerId,
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email,
        customerPhone: selectedCustomer.phone || "",
        productId: formData.productId,
        productName: selectedProduct.name,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        quantity: formData.quantity,
        basePrice: pricing.baseAmount,
        discountAmount: pricing.discountAmount,
        taxAmount: pricing.taxAmount,
        totalPrice: pricing.totalPrice,
        status: "confirmed",
        paymentStatus: "pending",
        paymentAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: formData.notes,
        pickupLocation: formData.pickupLocation,
        returnLocation: formData.returnLocation,
        securityDeposit: pricing.securityDeposit,
      };

      onBookingAdded(newBooking);
      onOpenChange(false);

      setFormData({
        customerId: "",
        productId: "",
        startDate: new Date(),
        endDate: addDays(new Date(), 1),
        quantity: 1,
        notes: "",
        pickupLocation: "Main Store",
        returnLocation: "Main Store",
      });

      toast({
        title: "Booking Created",
        description: `Booking for ${selectedProduct.name} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (
    field: "startDate" | "endDate",
    date: Date | undefined
  ) => {
    if (!date) return;

    setFormData((prev) => {
      const newData = { ...prev, [field]: date };

      if (field === "startDate" && date >= prev.endDate) {
        newData.endDate = addDays(date, 1);
      }
      if (field === "endDate" && date <= prev.startDate) {
        newData.startDate = addDays(date, -1);
      }

      return newData;
    });
  };

  const handleQuantityChange = (change: number) => {
    if (!selectedProduct) return;
    setFormData((prev) => ({
      ...prev,
      quantity: Math.max(
        1,
        Math.min(selectedProduct.stock, prev.quantity + change)
      ),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Add a new booking for a customer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) =>
                  setFormData({ ...formData, customerId: value })
                }>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {DUMMY_USERS.filter((u) => u.role === "customer").map(
                    (customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) =>
                  setFormData({ ...formData, productId: value })
                }>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {DUMMY_PRODUCTS.filter(
                    (p) => p.isRentable && p.stock > 0
                  ).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ₹{product.basePrice}/{product.unit} •{" "}
                            {product.stock} available
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pickup Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-transparent",
                      !formData.startDate && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate
                      ? format(formData.startDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleDateSelect("startDate", date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Return Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-transparent",
                      !formData.endDate && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate
                      ? format(formData.endDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleDateSelect("endDate", date)}
                    disabled={(date) => date <= formData.startDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={formData.quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Math.max(
                        1,
                        Number.parseInt(e.target.value) || 1
                      ),
                    })
                  }
                  className="text-center"
                  min="1"
                  max={selectedProduct?.stock || 1}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={
                    !selectedProduct ||
                    formData.quantity >= selectedProduct.stock
                  }>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {selectedProduct && (
                <p className="text-xs text-muted-foreground">
                  {selectedProduct.stock} available
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupLocation">Pickup Location</Label>
              <Input
                id="pickupLocation"
                value={formData.pickupLocation}
                onChange={(e) =>
                  setFormData({ ...formData, pickupLocation: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="returnLocation">Return Location</Label>
              <Input
                id="returnLocation"
                value={formData.returnLocation}
                onChange={(e) =>
                  setFormData({ ...formData, returnLocation: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or requirements..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          {selectedProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span>
                    {pricing.days} day{pricing.days > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Base Price ({formData.quantity} × ₹
                    {selectedProduct.basePrice} × {pricing.days})
                  </span>
                  <span>₹{pricing.baseAmount}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount (10%)</span>
                  <span>-₹{pricing.discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (9%)</span>
                  <span>₹{pricing.taxAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{pricing.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Security Deposit</span>
                  <span>₹{pricing.securityDeposit.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.customerId || !formData.productId}>
              {loading ? "Creating..." : "Create Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
