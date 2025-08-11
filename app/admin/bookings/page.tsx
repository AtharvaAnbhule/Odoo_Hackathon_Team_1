"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Eye, Filter, Calendar, Package, User, Phone, MapPin, CreditCard } from "lucide-react"
import { DUMMY_BOOKINGS } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import type { Booking } from "@/lib/types"

export default function AdminBookingsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const filteredBookings = DUMMY_BOOKINGS.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "picked-up":
        return "bg-orange-100 text-orange-800"
      case "returned":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "partial":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Booking status updated to ${newStatus}`,
    })
  }

  const BookingDetailsModal = ({ booking }: { booking: Booking }) => (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogDescription>Booking ID: {booking.id}</DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Name</span>
                <p className="font-medium">{booking.customerName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Email</span>
                <p className="font-medium">{booking.customerEmail}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Phone</span>
                <p className="font-medium flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {booking.customerPhone}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Customer ID</span>
                <p className="font-medium">{booking.customerId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product & Booking Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Booking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Product</span>
                <p className="font-medium">{booking.productName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Quantity</span>
                <p className="font-medium">{booking.quantity}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Pickup Date</span>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(booking.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Return Date</span>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(booking.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Pickup Location</span>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {booking.pickupLocation}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Return Location</span>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {booking.returnLocation}
                </p>
              </div>
            </div>
            {booking.notes && (
              <div>
                <span className="text-sm text-muted-foreground">Special Notes</span>
                <p className="font-medium">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Booking Status</span>
                <div className="mt-1">
                  <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Payment Status</span>
                <div className="mt-1">
                  <Badge className={getPaymentStatusColor(booking.paymentStatus)}>{booking.paymentStatus}</Badge>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <p className="font-bold text-lg">₹{booking.totalPrice}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Security Deposit</span>
                <p className="font-medium">₹{booking.securityDeposit}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex gap-2">
                <Select value={booking.status} onValueChange={(value) => handleStatusUpdate(booking.id, value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="picked-up">Picked Up</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Update Status</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  )

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-muted-foreground">Monitor and manage all rental bookings</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by customer, product, or booking ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="picked-up">Picked Up</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Bookings ({filteredBookings.length})</CardTitle>
            <CardDescription>Manage customer bookings and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.customerName}</div>
                        <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.productName}</div>
                        <div className="text-sm text-muted-foreground">Qty: {booking.quantity}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(booking.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-muted-foreground">to {new Date(booking.endDate).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(booking.paymentStatus)}>{booking.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">₹{booking.totalPrice}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        {selectedBooking && <BookingDetailsModal booking={selectedBooking} />}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
