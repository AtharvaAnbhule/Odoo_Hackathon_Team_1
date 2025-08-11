"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Calendar, Package, MapPin, CreditCard, Download, ArrowRight, ShoppingBag } from "lucide-react"
import type { Booking } from "@/lib/types"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("orderId")
  const paymentId = searchParams.get("paymentId")
  const [booking, setBooking] = useState<Booking | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      if (orderId) {
        try {
          const { bookingsAPI } = await import("@/lib/api")
          const response = await bookingsAPI.getById(orderId)
          setBooking(response.booking)
        } catch (error) {
          console.error("Error fetching booking:", error)
        }
      }
    }

    fetchBooking()
  }, [orderId])

  if (!booking) {
    return (
      <DashboardLayout requiredRole="customer">
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/customer/dashboard")}>Go to Dashboard</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="customer">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="text-center bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">Payment Successful!</h1>
            <p className="text-green-700 mb-4">
              Your order has been confirmed and payment processed successfully. You'll receive a confirmation email
              shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">Order ID: {booking.id}</Badge>
              {paymentId && (
                <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">Payment ID: {paymentId}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center border">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{booking.productName}</h3>
                <p className="text-muted-foreground">Quantity: {booking.quantity}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(booking.startDate).toLocaleDateString()} -{" "}
                    {new Date(booking.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">₹{booking.totalPrice.toFixed(2)}</p>
                <Badge className="bg-green-100 text-green-800 mt-1">Paid</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Rental Amount</span>
              <span>₹{booking.basePrice.toFixed(2)}</span>
            </div>
            {booking.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount Applied</span>
                <span>-₹{booking.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax & Fees</span>
              <span>₹{booking.taxAmount.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Paid</span>
              <span>₹{booking.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Security Deposit (Refundable)</span>
              <span>₹{booking.securityDeposit.toFixed(2)}</span>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Payment Method</span>
                <Badge variant="outline">Online Payment</Badge>
              </div>
              {paymentId && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">Transaction ID</span>
                  <span className="text-sm font-mono">{paymentId}</span>
                </div>
              )}
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">Payment Date</span>
                <span className="text-sm">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rental Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Rental Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Pickup Date</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {new Date(booking.startDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Return Date</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {new Date(booking.endDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Pickup Location</span>
                  </div>
                  <p>{booking.pickupLocation}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Return Location</span>
                  </div>
                  <p>{booking.returnLocation}</p>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Special Instructions</span>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Order Confirmation</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email confirmation with all order details within the next few minutes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Preparation & Contact</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team will prepare your rental and contact you 24 hours before pickup with detailed instructions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Pickup & Enjoy</h4>
                  <p className="text-sm text-muted-foreground">
                    Visit our location at the scheduled time with a valid ID to collect your rental item.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1" onClick={() => router.push("/customer/my-bookings")}>
            <Package className="h-4 w-4 mr-2" />
            View My Orders
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/customer/products")}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
          <Button variant="outline" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </div>

        {/* Support Information */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-blue-800 mb-2">Need Assistance?</h3>
              <p className="text-blue-700 text-sm mb-4">
                Our customer support team is available 24/7 to help you with any questions about your order.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button size="sm" variant="outline" className="bg-white border-blue-300 text-blue-700">
                  📞 Call: +91 9876543210
                </Button>
                <Button size="sm" variant="outline" className="bg-white border-blue-300 text-blue-700">
                  ✉️ Email: support@rentalpro.com
                </Button>
                <Button size="sm" variant="outline" className="bg-white border-blue-300 text-blue-700">
                  💬 Live Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
