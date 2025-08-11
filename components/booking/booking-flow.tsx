"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CalendarIcon,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/payment/payment-modal";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import type { Product, Booking } from "@/lib/types";

interface BookingFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onBookingComplete: (booking: Booking) => void;
}

export function BookingFlow({
  open,
  onOpenChange,
  product,
  onBookingComplete,
}: BookingFlowProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    startDate: new Date(),
    endDate: addDays(new Date(), 1),
    quantity: 1,
    notes: "",
    pickupLocation: "Main Store",
    returnLocation: "Main Store",
  });
  const [customerData, setCustomerData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculatePricing = () => {
    const days = Math.max(
      1,
      differenceInDays(bookingData.endDate, bookingData.startDate)
    );
    const baseAmount = product.basePrice * bookingData.quantity * days;
    const discountAmount = baseAmount * 0.1;
    const taxAmount = (baseAmount - discountAmount) * 0.09;
    const totalPrice = baseAmount - discountAmount + taxAmount;
    const securityDeposit = product.basePrice * bookingData.quantity * 0.5;

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

  const handleDateSelect = (
    field: "startDate" | "endDate",
    date: Date | undefined
  ) => {
    if (!date) return;

    setBookingData((prev) => {
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
    setBookingData((prev) => ({
      ...prev,
      quantity: Math.max(1, Math.min(product.stock, prev.quantity + change)),
    }));
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return (
          bookingData.startDate &&
          bookingData.endDate &&
          bookingData.quantity > 0
        );
      case 2:
        return customerData.name && customerData.email && customerData.phone;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleCreateBooking = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerData,
          bookingData: {
            ...bookingData,
            startDate: bookingData.startDate.toISOString(),
            endDate: bookingData.endDate.toISOString(),
          },
          product,
          pricing,
          userId: user?.id || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      const booking: Booking = await response.json();
      setCreatedBooking(booking);
      setShowPayment(true);
    } catch (error) {
      toast({
        title: "Booking Failed",
        description:
          "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    if (createdBooking) {
      const updatedBooking: Booking = {
        ...createdBooking,
        paymentStatus: paymentData.status === "completed" ? "paid" : "pending",
        paymentAmount: paymentData.amount,
        status: "confirmed",
      };

      onBookingComplete(updatedBooking);
      setShowPayment(false);
      onOpenChange(false);

      setStep(1);
      setCreatedBooking(null);
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Error",
      description: error,
      variant: "destructive",
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Dates & Quantity</h3>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label>Pickup Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-transparent",
                    !bookingData.startDate && "text-muted-foreground"
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {bookingData.startDate
                    ? format(bookingData.startDate, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={bookingData.startDate}
                  onSelect={(date) => handleDateSelect("startDate", date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Return Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-transparent",
                    !bookingData.endDate && "text-muted-foreground"
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {bookingData.endDate
                    ? format(bookingData.endDate, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={bookingData.endDate}
                  onSelect={(date) => handleDateSelect("endDate", date)}
                  disabled={(date) => date <= bookingData.startDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <Label>Quantity</Label>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(-1)}
              disabled={bookingData.quantity <= 1}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold w-12 text-center">
              {bookingData.quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(1)}
              disabled={bookingData.quantity >= product.stock}>
              <Plus className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              ({product.stock} available)
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Special Requirements (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any special instructions or requirements..."
            value={bookingData.notes}
            onChange={(e) =>
              setBookingData((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={3}
          />
        </div>
      </div>

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
              Base Price ({bookingData.quantity} × ₹{product.basePrice} ×{" "}
              {pricing.days})
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
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="name"
                placeholder="Enter your full name"
                value={customerData.name}
                onChange={(e) =>
                  setCustomerData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="phone"
                placeholder="+91 9876543210"
                value={customerData.phone}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={customerData.email}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="pl-10"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Pickup & Return</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pickup Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={bookingData.pickupLocation}
                onChange={(e) =>
                  setBookingData((prev) => ({
                    ...prev,
                    pickupLocation: e.target.value,
                  }))
                }
                className="pl-10"
                placeholder="Pickup location"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Return Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={bookingData.returnLocation}
                onChange={(e) =>
                  setBookingData((prev) => ({
                    ...prev,
                    returnLocation: e.target.value,
                  }))
                }
                className="pl-10"
                placeholder="Return location"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review Your Booking</h3>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{product.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {product.category}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {format(bookingData.startDate, "MMM dd")} -{" "}
                    {format(bookingData.endDate, "MMM dd")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Qty: {bookingData.quantity}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Name:</span>
              <span className="font-medium">{customerData.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-medium">{customerData.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone:</span>
              <span className="font-medium">{customerData.phone}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Rental Amount</span>
              <span>₹{pricing.baseAmount}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{pricing.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{pricing.taxAmount.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total to Pay</span>
              <span>₹{pricing.totalPrice.toFixed(2)}</span>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A security deposit of ₹{pricing.securityDeposit.toFixed(2)} will
                be held and refunded after return.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Book {product.name}</DialogTitle>
            <DialogDescription>
              Complete your booking in{" "}
              {step === 1 ? "3 simple steps" : `step ${step} of 3`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step >= stepNumber
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                  {step > stepNumber ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={cn(
                      "w-16 h-0.5 mx-2",
                      step > stepNumber ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="min-h-[400px]">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() =>
                step > 1 ? setStep(step - 1) : onOpenChange(false)
              }
              className="bg-transparent">
              {step > 1 ? "Previous" : "Cancel"}
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext} disabled={!validateStep(step)}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleCreateBooking} disabled={loading}>
                {loading ? "Creating Booking..." : "Proceed to Payment"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {createdBooking && (
        <PaymentModal
          open={showPayment}
          onOpenChange={setShowPayment}
          booking={createdBooking}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </>
  );
}
