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
  AlertTriangle,
} from "lucide-react";
import { DUMMY_BOOKINGS } from "@/lib/data";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import axios from "axios";

// Dynamically import Leaflet to avoid SSR issues
const MapWithNoSSR = dynamic(() => import("./map-component"), {
  ssr: false,
});

const reportSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  priority: z.enum(["low", "medium", "high"]),
});

type Issue = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in-progress" | "resolved";
  createdAt: string;
  updatedAt: string;
};

export function StaffDashboard() {
  const { toast } = useToast();
  const [showRoutePlanner, setShowRoutePlanner] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [todayPickups, setTodayPickups] = useState(
    DUMMY_BOOKINGS.filter(
      (booking) =>
        booking.status === "confirmed" &&
        new Date(booking.startDate).toDateString() === new Date().toDateString()
    )
  );
  const [pendingReturns, setPendingReturns] = useState(
    DUMMY_BOOKINGS.filter((booking) => booking.status === "picked-up")
  );
  const [overdueReturns, setOverdueReturns] = useState(
    DUMMY_BOOKINGS.filter((booking) => booking.status === "overdue")
  );
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
    },
  });

  // Fetch issues from API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/issue");
        setIssues(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch issues",
          variant: "destructive",
        });
      } finally {
        setLoadingIssues(false);
      }
    };
    fetchIssues();
  }, []);

  const handleMarkPickedUp = (bookingId: string) => {
    setTodayPickups(todayPickups.filter((booking) => booking.id !== bookingId));
    toast({
      title: "Success",
      description: "Item marked as picked up",
    });
  };

  const handleMarkReturned = (bookingId: string) => {
    setPendingReturns(
      pendingReturns.filter((booking) => booking.id !== bookingId)
    );
    setOverdueReturns(
      overdueReturns.filter((booking) => booking.id !== bookingId)
    );
    toast({
      title: "Success",
      description: "Item marked as returned",
    });
  };

  const onSubmit = async (data: z.infer<typeof reportSchema>) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/issue",
        data
      );
      setIssues([response.data, ...issues]);
      toast({
        title: "Success",
        description: "Issue reported successfully",
      });
      setShowReportForm(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit issue",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "open":
        return "bg-blue-100 text-blue-800";
      case "picked-up":
      case "in-progress":
        return "bg-orange-100 text-orange-800";
      case "returned":
      case "resolved":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityDotColor = (isOverdue: boolean) => {
    return isOverdue ? "bg-red-500" : "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header Card */}
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

      {/* Stats Cards */}
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

      {/* Today's Pickups Card */}
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
                    <Button
                      size="sm"
                      onClick={() => handleMarkPickedUp(booking.id)}>
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

      {/* Pending Returns Card */}
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
                          className={`w-2 h-2 rounded-full ${getPriorityDotColor(
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
                        <Button
                          size="sm"
                          onClick={() => handleMarkReturned(booking.id)}>
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

      {/* Issues Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Reported Issues</CardTitle>
            <CardDescription>
              Track and manage all reported issues
            </CardDescription>
          </div>
          <Button onClick={() => setShowReportForm(true)}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            New Issue
          </Button>
        </CardHeader>
        <CardContent>
          {loadingIssues ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : issues.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">{issue.title}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {issue.description}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(issue.priority)}>
                        {issue.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                No issues reported yet
              </h3>
              <p className="text-muted-foreground">
                Click the button above to report your first issue
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
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

            <Button
              variant="outline"
              className="h-20 flex-col bg-transparent"
              onClick={() => setShowRoutePlanner(true)}>
              <MapPin className="h-6 w-6 mb-2" />
              Route Planner
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col bg-transparent"
              onClick={() => setShowReportForm(true)}>
              <AlertTriangle className="h-6 w-6 mb-2" />
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Route Planner Modal */}
      <Dialog open={showRoutePlanner} onOpenChange={setShowRoutePlanner}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Route Planner</DialogTitle>
            <DialogDescription>
              Optimize your pickup and delivery routes
            </DialogDescription>
          </DialogHeader>
          <div className="h-full w-full rounded-lg overflow-hidden">
            <MapWithNoSSR
              //@ts-ignore
              pickups={todayPickups}
              pendingReturns={pendingReturns}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRoutePlanner(false)}>
              Close
            </Button>
            <Button>
              <MapPin className="h-4 w-4 mr-2" />
              Optimize Route
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Issue Modal */}
      <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              Describe the issue you encountered
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief title of the issue"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the issue"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant={
                            field.value === "low" ? "default" : "outline"
                          }
                          onClick={() => field.onChange("low")}>
                          Low
                        </Button>
                        <Button
                          type="button"
                          variant={
                            field.value === "medium" ? "default" : "outline"
                          }
                          onClick={() => field.onChange("medium")}>
                          Medium
                        </Button>
                        <Button
                          type="button"
                          variant={
                            field.value === "high" ? "default" : "outline"
                          }
                          onClick={() => field.onChange("high")}>
                          High
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowReportForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Submit Report
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
