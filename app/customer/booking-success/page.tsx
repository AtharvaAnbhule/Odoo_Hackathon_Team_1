"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Calendar, Package, MapPin, CreditCard, Download, ArrowRight, Home } from "lucide-react"
import { DUMMY_BOOKINGS } from "@/lib/data"
import type { Booking } from "@/lib/types"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get("bookingId")
  const [booking, setBooking] = useState<Booking | null>(null)

  useEffect(() => {
    if (bookingId) {
      // In a real app, this would fetch from API
      const foundBooking = DUMMY_BOOKINGS.find((b) => b.id === bookingId)
      if (foundBooking) {
        setBooking(foundBooking)
      }
    }
  }, [bookingId])

  if (!booking) {
    return (
      <DashboardLayout requiredRole="customer">
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
            <p className="text-muted-foreground mb-4">The booking you're looking for doesn't exist.</p>
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
        <Card className="text-center bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">Booking Confirmed!</h1>
            <p className="text-green-700 mb-4">
              Your rental booking has been successfully confirmed. We'll contact you soon with pickup details.
            </p>
            <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">Booking ID: {booking.id}</Badge>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="h-6 w-6" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{booking.productName}</h3>
                  <p className="text-muted-foreground">Quantity: {booking.quantity}</p>
                </div>

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

                {booking.notes && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Special Notes</span>
                    <p className="text-sm text-muted-foreground">{booking.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Rental Amount</span>
              <span>₹{booking.basePrice}</span>
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
            <div className="flex justify-between text-lg font-bold">
              <span>Total Paid</span>
              <span>₹{booking.totalPrice}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Security Deposit (Refundable)</span>
              <span>₹{booking.securityDeposit}</span>
            </div>
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-800">Payment Status: {booking.paymentStatus}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Confirmation Call</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team will contact you within 2 hours to confirm pickup details and timing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Pickup Preparation</h4>
                  <p className="text-sm text-muted-foreground">
                    Please bring a valid ID and be ready at the scheduled pickup time.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Enjoy Your Rental</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the product as needed and return it in good condition by the return date.
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
            View My Bookings
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => router.push("/customer/dashboard")}
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button variant="outline" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </div>

        {/* Contact Support */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
              <p className="text-blue-700 text-sm mb-4">
                Our customer support team is here to help you with any questions about your booking.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button size="sm" variant="outline" className="bg-white border-blue-300 text-blue-700">
                  Call Support: +91 9876543210
                </Button>
                <Button size="sm" variant="outline" className="bg-white border-blue-300 text-blue-700">
                  Email: support@rentalpro.com
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
