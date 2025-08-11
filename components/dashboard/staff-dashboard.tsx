"use client";

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
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
} from "lucide-react";
import { DUMMY_BOOKINGS } from "@/lib/data";

export function StaffDashboard() {
  const todayPickups = DUMMY_BOOKINGS.filter(
    (booking) =>
      booking.status === "confirmed" &&
      new Date(booking.startDate).toDateString() === new Date().toDateString()
  );

  const pendingReturns = DUMMY_BOOKINGS.filter(
    (booking) => booking.status === "picked-up"
  );

  const overdueReturns = DUMMY_BOOKINGS.filter(
    (booking) => booking.status === "overdue"
  );

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

  const getPriorityColor = (isOverdue: boolean) => {
    return isOverdue ? "bg-red-500" : "bg-green-500";
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Staff Dashboard</CardTitle>
          <CardDescription className="text-green-100">
            Manage pickups, returns, and inventory operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{todayPickups.length}</div>
              <p className="text-sm opacity-90">Today's Pickups</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{pendingReturns.length}</div>
              <p className="text-sm opacity-90">Pending Returns</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{overdueReturns.length}</div>
              <p className="text-sm opacity-90">Overdue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Pickups
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayPickups.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Returns
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReturns.length}</div>
            <p className="text-xs text-muted-foreground">
              Items to be returned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueReturns.length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Today's Pickups</CardTitle>
            <CardDescription>
              Scheduled pickups for {new Date().toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant="secondary">{todayPickups.length} items</Badge>
        </CardHeader>
        <CardContent>
          {todayPickups.length > 0 ? (
            <div className="space-y-4">
              {todayPickups.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{booking.productName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {booking.customerName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">
                          Pickup:{" "}
                          {new Date(booking.startDate).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Picked Up
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                No pickups scheduled
              </h3>
              <p className="text-muted-foreground">
                All scheduled pickups for today are completed
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Returns</CardTitle>
            <CardDescription>Items currently with customers</CardDescription>
          </div>
          <Badge variant="secondary">{pendingReturns.length} items</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingReturns.map((booking) => {
                const isOverdue = new Date(booking.endDate) < new Date();
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.customerName}
                    </TableCell>
                    <TableCell>{booking.productName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(booking.endDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${getPriorityColor(
                            isOverdue
                          )}`}
                        />
                        <span className="text-xs">
                          {isOverdue ? "Overdue" : "Normal"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Process Return
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common staff operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex-col">
              <Package className="h-6 w-6 mb-2" />
              Scan QR Code
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Calendar className="h-6 w-6 mb-2" />
              View Schedule
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <MapPin className="h-6 w-6 mb-2" />
              Route Planner
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <AlertCircle className="h-6 w-6 mb-2" />
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
