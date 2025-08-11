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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Package,
  CreditCard,
  Star,
  Plus,
  Eye,
  Bell,
  User,
} from "lucide-react";
import { DUMMY_BOOKINGS, DUMMY_PRODUCTS } from "@/lib/data";
import { ProductCatalog } from "@/components/products/product-catalog";
import { BookingFlow } from "@/components/booking/booking-flow";
import { CalendarView } from "@/components/calendar/calendar-view";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { UserProfile } from "@/components/profile/user-profile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { Product, Booking } from "@/lib/types";

export function CustomerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [showProductCatalog, setShowProductCatalog] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const userBookings = DUMMY_BOOKINGS.filter(
    (booking) => booking.customerId === user?.id || booking.customerId === "2"
  );
  const upcomingBookings = userBookings.filter(
    (booking) =>
      booking.status === "confirmed" || booking.status === "picked-up"
  );
  const totalSpent = userBookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0
  );

  const handleNewBooking = () => {
    setShowProductCatalog(true);
  };

  const handleBookProduct = (productId: string) => {
    const product = DUMMY_PRODUCTS.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowBooking(true);
      setShowProductCatalog(false);
    }
  };

  const handleBookingComplete = (booking: Booking) => {
    toast({
      title: "Booking Successful!",
      description: `Your booking for ${booking.productName} has been confirmed.`,
    });
    setShowBooking(false);
    setSelectedProduct(null);
    router.push(`/customer/booking-success?bookingId=${booking.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "picked-up":
        return "bg-orange-100 text-orange-800";
      case "returned":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "partial":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome back, {user?.name || "John"}!
          </CardTitle>
          <CardDescription className="text-blue-100">
            Manage your rentals and discover new products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={handleNewBooking}>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              onClick={() => setShowCalendar(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
            <Button onClick={() => router.push("/ai-suggestions")}>
              <Plus className="h-4 w-4 mr-2" />
              AI Suggestion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Rentals
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            <p className="text-xs text-muted-foreground">Currently renting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBookings.length}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Loyalty Points
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250</div>
            <p className="text-xs text-muted-foreground">₹125 credit value</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Rentals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Current Rentals</CardTitle>
            <CardDescription>Your active and upcoming rentals</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(true)}>
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfile(true)}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button onClick={handleNewBooking}>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{booking.productName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.startDate).toLocaleDateString()} -{" "}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <Badge
                          className={getPaymentStatusColor(
                            booking.paymentStatus
                          )}>
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{booking.totalPrice}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 bg-transparent">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No active rentals</h3>
              <p className="text-muted-foreground mb-4">
                Start exploring our products to make your first booking
              </p>
              <Button onClick={handleNewBooking}>Browse Products</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking History */}
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
          <CardDescription>Your past rental activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.productName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(booking.startDate).toLocaleDateString()} -{" "}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getPaymentStatusColor(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{booking.totalPrice}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col" onClick={handleNewBooking}>
              <Package className="h-6 w-6 mb-2" />
              Browse Products
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col bg-transparent"
              onClick={() => setShowCalendar(true)}>
              <Calendar className="h-6 w-6 mb-2" />
              View Calendar
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <CreditCard className="h-6 w-6 mb-2" />
              Payment History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Catalog Modal */}
      <Dialog open={showProductCatalog} onOpenChange={setShowProductCatalog}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Browse Products</DialogTitle>
            <DialogDescription>Select a product to book</DialogDescription>
          </DialogHeader>
          <ProductCatalog onBookProduct={handleBookProduct} />
        </DialogContent>
      </Dialog>

      {/* Calendar Modal */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Calendar</DialogTitle>
            <DialogDescription>
              View your bookings and available dates
            </DialogDescription>
          </DialogHeader>
          <CalendarView bookings={userBookings} />
        </DialogContent>
      </Dialog>

      {/* Notifications Modal */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              Your recent notifications and updates
            </DialogDescription>
          </DialogHeader>
          <NotificationPanel userId={user?.id || "2"} />
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Manage your account information
            </DialogDescription>
          </DialogHeader>
          <UserProfile user={user} />
        </DialogContent>
      </Dialog>

      {/* Booking Flow */}
      {selectedProduct && (
        <BookingFlow
          open={showBooking}
          onOpenChange={setShowBooking}
          product={selectedProduct}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}
