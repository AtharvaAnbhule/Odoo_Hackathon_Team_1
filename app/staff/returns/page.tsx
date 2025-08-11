"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Package, Calendar, Phone, MapPin, CheckCircle, AlertTriangle, User, Filter, Clock } from "lucide-react"
import { DUMMY_BOOKINGS } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import type { Booking } from "@/lib/types"

export default function StaffReturnsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [returnNotes, setReturnNotes] = useState("")
  const [damageCharges, setDamageCharges] = useState("")

  // Filter bookings for returns
  const returnBookings = DUMMY_BOOKINGS.filter(
    (booking) => booking.status === "picked-up" || booking.status === "overdue",
  )

  const filteredBookings = returnBookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleProcessReturn = (bookingId: string) => {
    toast({
      title: "Return Processed",
      description: "Item has been successfully returned and checked",
    })
    setSelectedBooking(null)
    setReturnNotes("")
    setDamageCharges("")
  }

  const handleContactCustomer = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "picked-up":
        return "bg-orange-100 text-orange-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (booking: Booking) => {
    const returnDate = new Date(booking.endDate)
    const today = new Date()

    if (returnDate < today) return "border-l-4 border-red-500 bg-red-50"
    if (returnDate.toDateString() === today.toDateString()) return "border-l-4 border-orange-500 bg-orange-50"
    return "border-l-4 border-blue-500 bg-blue-50"
  }

  const isOverdue = (booking: Booking) => {
    return new Date(booking.endDate) < new Date()
  }

  const ReturnProcessModal = ({ booking }: { booking: Booking }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Process Return</DialogTitle>
        <DialogDescription>Complete the return process for {booking.productName}</DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Return Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Customer</span>
                <p className="font-medium">{booking.customerName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Product</span>
                <p className="font-medium">{booking.productName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Expected Return</span>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(booking.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={getStatusColor(booking.status)}>
                  {isOverdue(booking) ? "Overdue" : booking.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Return Condition Notes</label>
            <Textarea
              placeholder="Describe the condition of the returned item..."
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Damage Charges (if any)</label>
            <Input
              type="number"
              placeholder="0"
              value={damageCharges}
              onChange={(e) => setDamageCharges(e.target.value)}
            />
          </div>

          {isOverdue(booking) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Overdue Return</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                This item is{" "}
                {Math.ceil((new Date().getTime() - new Date(booking.endDate).getTime()) / (1000 * 60 * 60 * 24))} days
                overdue. Late fees may apply.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => handleProcessReturn(booking.id)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Return
          </Button>
          <Button variant="outline" className="bg-transparent">
            <Phone className="h-4 w-4 mr-2" />
            Contact Customer
          </Button>
        </div>
      </div>
    </DialogContent>
  )

  return (
    <DashboardLayout requiredRole="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Return Management</h1>
          <p className="text-muted-foreground">Process returns and manage overdue items</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Due Today</p>
                  <p className="text-2xl font-bold">
                    {
                      returnBookings.filter((b) => new Date(b.endDate).toDateString() === new Date().toDateString())
                        .length
                    }
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Returns</p>
                  <p className="text-2xl font-bold">{returnBookings.filter((b) => b.status === "picked-up").length}</p>
                </div>
                <Package className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{returnBookings.filter((b) => isOverdue(b)).length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">8</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Returns
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
                    <SelectItem value="picked-up">Pending Return</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Returns List */}
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <Card key={booking.id} className={getPriorityColor(booking)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{booking.productName}</h3>
                          <p className="text-sm text-muted-foreground">Booking ID: {booking.id}</p>
                          {isOverdue(booking) && (
                            <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>
                                {Math.ceil(
                                  (new Date().getTime() - new Date(booking.endDate).getTime()) / (1000 * 60 * 60 * 24),
                                )}{" "}
                                days overdue
                              </span>
                            </div>
                          )}
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {isOverdue(booking) ? "Overdue" : booking.status}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{booking.customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{booking.returnLocation}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Due: {new Date(booking.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{new Date(booking.endDate).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Quantity: {booking.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleContactCustomer(booking.customerPhone)}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedBooking(booking)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Process Return
                          </Button>
                        </DialogTrigger>
                        {selectedBooking && <ReturnProcessModal booking={selectedBooking} />}
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No returns found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "No items are currently due for return"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
