"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  Shield,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { initiateRazorpayPayment, createRazorpayOrder } from "@/lib/razorpay";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@/lib/types";
import { useRouter } from "next/navigation";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  booking,
  onPaymentSuccess,
  onPaymentError,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState("razorpay");
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const paymentMethods = [
    {
      id: "razorpay",
      name: "Online Payment",
      description: "Pay securely with cards, UPI, wallets",
      icon: CreditCard,
      fee: 2.5,
      features: [
        "Instant confirmation",
        "Secure encryption",
        "Multiple payment options",
      ],
    },
    {
      id: "cash",
      name: "Cash on Pickup",
      description: "Pay cash when you collect the item",
      icon: Banknote,
      fee: 0,
      features: ["No processing fee", "Pay at pickup", "Flexible payment"],
    },
  ];

  const calculateTotal = () => {
    const method = paymentMethods.find((m) => m.id === selectedMethod);
    const processingFee = method ? (booking.totalPrice * method.fee) / 100 : 0;
    return booking.totalPrice + processingFee;
  };

  const handlePayment = async () => {
    setLoading(true);
    setProcessingPayment(true);

    try {
      if (selectedMethod === "cash") {
        // Handle cash payment
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate processing

        const paymentData = {
          method: "cash",
          status: "pending",
          amount: booking.totalPrice,
          bookingId: booking.id,
          transactionId: `CASH_${Date.now()}`,
        };

        onPaymentSuccess(paymentData);
        toast({
          title: "Booking Confirmed!",
          description:
            "You can pay cash during pickup. We'll contact you soon.",
        });
        onOpenChange(false);
      } else {
        // Handle Razorpay payment
        const order = await createRazorpayOrder(calculateTotal());

        await initiateRazorpayPayment({
          order_id: order.id,
          amount: order.amount,
          prefill: {
            name: booking.customerName,
            email: booking.customerEmail,
            contact: booking.customerPhone,
          },
          handler: (response) => {
            const paymentData = {
              method: "razorpay",
              status: "completed",
              amount: calculateTotal(),
              bookingId: booking.id,
              transactionId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            };

            onPaymentSuccess(paymentData);
            toast({
              title: "Payment Successful!",
              description:
                "Your booking has been confirmed. Check your email for details.",
            });
            onOpenChange(false);
          },
          modal: {
            ondismiss: () => {
              setProcessingPayment(false);
              setLoading(false);
            },
          },
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      onPaymentError(error instanceof Error ? error.message : "Payment failed");
      toast({
        title: "Payment Failed",
        description:
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProcessingPayment(false);
    }
  };

  const selectedMethodData = paymentMethods.find(
    (m) => m.id === selectedMethod
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Your Payment</DialogTitle>
          <DialogDescription>
            Choose your preferred payment method to confirm your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">{booking.productName}</span>
                <span>₹{booking.basePrice}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Quantity: {booking.quantity}</span>
                <span>
                  Duration:{" "}
                  {Math.ceil(
                    (new Date(booking.endDate).getTime() -
                      new Date(booking.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </span>
              </div>
              {booking.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{booking.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{booking.taxAmount}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>₹{booking.totalPrice}</span>
              </div>
              {selectedMethodData?.fee && selectedMethodData.fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Processing Fee ({selectedMethodData.fee}%)</span>
                  <span>
                    ₹
                    {(
                      (booking.totalPrice * selectedMethodData.fee) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
              <CardDescription>
                Select how you'd like to pay for your rental
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedMethod}
                onValueChange={setSelectedMethod}
                className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="relative">
                    <RadioGroupItem
                      value={method.id}
                      id={method.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={method.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5">
                      <method.icon className="h-6 w-6 mt-1 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{method.name}</h3>
                          {method.fee === 0 ? (
                            <Badge variant="secondary">No Fee</Badge>
                          ) : (
                            <Badge variant="outline">{method.fee}% fee</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {method.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {method.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Security Info */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your payment information is secure and encrypted. We use
              industry-standard security measures to protect your data.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {processingPayment ? "Processing..." : "Please wait..."}
                </>
              ) : (
                <>
                  {selectedMethod === "cash" ? (
                    <>
                      <Banknote className="mr-2 h-4 w-4" />
                      <Button onClick={() => router.push("/success")}>
                        Confirm Booking
                      </Button>
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay ₹{calculateTotal().toFixed(2)}
                    </>
                  )}
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          {selectedMethod === "cash" && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Cash Payment:</strong> You'll need to pay ₹
                {booking.totalPrice} in cash during pickup. Our staff will
                contact you to arrange the pickup time and location.
              </AlertDescription>
            </Alert>
          )}

          {selectedMethod === "razorpay" && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  Cards
                </div>
                <div className="flex items-center gap-1">
                  <Smartphone className="h-4 w-4" />
                  UPI
                </div>
                <div className="flex items-center gap-1">
                  <Wallet className="h-4 w-4" />
                  Wallets
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
