"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Package, Calendar, Phone, MapPin, CheckCircle, Clock, User, Filter } from "lucide-react"
import { DUMMY_BOOKINGS } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import type { Booking } from "@/lib/types"

export default function StaffPickupsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("today")

  // Filter bookings for pickups
  const pickupBookings = DUMMY_BOOKINGS.filter(
    (booking) => booking.status === "confirmed" || booking.status === "pending",
  )

  const filteredBookings = pickupBookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())

    const bookingDate = new Date(booking.startDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = bookingDate.toDateString() === today.toDateString()
    } else if (dateFilter === "tomorrow") {
      matchesDate = bookingDate.toDateString() === tomorrow.toDateString()
    } else if (dateFilter === "overdue") {
      matchesDate = bookingDate < today && booking.status === "confirmed"
    }

    return matchesSearch && matchesDate
  })

  const handleMarkPickedUp = (bookingId: string) => {
    toast({
      title: "Pickup Confirmed",
      description: "Booking status updated to picked up",
    })
  }

  const handleContactCustomer = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (booking: Booking) => {
    const pickupDate = new Date(booking.startDate)
    const today = new Date()

    if (pickupDate < today) return "border-l-4 border-red-500 bg-red-50"
    if (pickupDate.toDateString() === today.toDateString()) return "border-l-4 border-orange-500 bg-orange-50"
    return "border-l-4 border-green-500 bg-green-50"
  }

  return (
    <DashboardLayout requiredRole="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pickup Management</h1>
          <p className="text-muted-foreground">Manage scheduled pickups and customer handovers</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Pickups</p>
                  <p className="text-2xl font-bold">
                    {
                      filteredBookings.filter((b) => new Date(b.startDate).toDateString() === new Date().toDateString())
                        .length
                    }
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pickupBookings.filter((b) => b.status === "pending").length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold">{pickupBookings.filter((b) => b.status === "confirmed").length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">
                    {
                      pickupBookings.filter((b) => new Date(b.startDate) < new Date() && b.status === "confirmed")
                        .length
                    }
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Pickups
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
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pickup List */}
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
                        </div>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
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
                            <span className="text-sm">{booking.pickupLocation}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{new Date(booking.startDate).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Quantity: {booking.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" onClick={() => handleContactCustomer(booking.customerPhone)}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button size="sm" onClick={() => handleMarkPickedUp(booking.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Picked Up
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pickups found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || dateFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "No pickups scheduled for the selected period"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
