"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CalendarIcon,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  FileText,
  Filter,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useReactToPrint } from "react-to-print";
import type { Booking, Product } from "@/lib/types";

interface ReportsDashboardProps {
  bookings: Booking[];
}

export function ReportsDashboard({ bookings }: ReportsDashboardProps) {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [reportType, setReportType] = useState("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch("http://localhost:5000/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter data based on date range
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.createdAt);
    return (
      (!dateRange.from || bookingDate >= dateRange.from) &&
      (!dateRange.to || bookingDate <= dateRange.to)
    );
  });

  // Calculate metrics
  const totalRevenue = filteredBookings.reduce(
    (sum, booking) => sum + (booking.totalPrice || 0),
    0
  );
  const totalBookings = filteredBookings.length;
  const activeCustomers = new Set(
    filteredBookings.map((b) => b.customerId || b.customerName)
  ).size;
  const averageBookingValue =
    totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Generate revenue data by month
  const revenueData = filteredBookings.reduce((acc, booking) => {
    const month = new Date(booking.createdAt).toLocaleString("default", {
      month: "short",
    });
    if (!acc[month]) {
      acc[month] = { revenue: 0, bookings: 0 };
    }
    acc[month].revenue += booking.totalPrice || 0;
    acc[month].bookings++;
    return acc;
  }, {} as Record<string, { revenue: number; bookings: number }>);

  const revenueChartData = Object.entries(revenueData).map(
    ([month, { revenue, bookings }]) => ({
      month,
      revenue,
      bookings,
    })
  );

  // Generate category distribution data
  const categoryData = products.reduce((acc, product) => {
    const category = product.tags?.[0] || "Uncategorized";
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(
    ([name, value]) => ({
      name,
      value,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    })
  );

  // Top performing products
  const topProducts = [...products]
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 5)
    .map((product) => ({
      name: product.name,
      bookings: Math.floor((product.popularity || 0) / 10),
      revenue: Math.floor(
        (product.popularity || 0) * (product.basePrice || 0) * 2.5
      ),
      category: product.tags?.[0] || "Uncategorized",
    }));

  // Booking status overview
  const bookingStatusData = filteredBookings.reduce((acc, booking) => {
    if (!acc[booking.status]) {
      acc[booking.status] = 0;
    }
    acc[booking.status]++;
    return acc;
  }, {} as Record<string, number>);

  const statusColors: Record<string, string> = {
    confirmed: "bg-blue-100 text-blue-800",
    "picked-up": "bg-orange-100 text-orange-800",
    returned: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
  };

  // Handle PDF export
  const handleExportPDF = useReactToPrint({
    content: () => reportRef.current,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 10mm;
      }
      body {
        padding: 20px;
        font-family: sans-serif;
      }
      .print-section {
        break-inside: avoid;
        margin-bottom: 20px;
      }
      .chart-container {
        width: 100% !important;
        height: 300px !important;
      }
    `,
    documentTitle: `RentEase_Report_${format(new Date(), "yyyyMMdd")}`,
  });

  // Handle CSV export
  const handleExportCSV = (type: string) => {
    let csvContent = "";
    let filename = "";

    switch (type) {
      case "revenue":
        filename = `Revenue_Report_${format(new Date(), "yyyyMMdd")}.csv`;
        csvContent = [
          "Month,Revenue,Bookings",
          ...revenueChartData.map(
            ({ month, revenue, bookings }) => `${month},${revenue},${bookings}`
          ),
        ].join("\n");
        break;
      case "inventory":
        filename = `Inventory_Report_${format(new Date(), "yyyyMMdd")}.csv`;
        csvContent = [
          "Product Name,Category,Stock,Status,Base Price",
          ...products.map(
            (product) =>
              `${product.name},"${
                product.tags?.join(", ") || "Uncategorized"
              }",${product.stock}/${product.totalStock},${
                product.stock === 0
                  ? "Out of Stock"
                  : product.stock < (product.totalStock || 0) * 0.2
                  ? "Low Stock"
                  : "In Stock"
              },${product.basePrice}/${product.unit}`
          ),
        ].join("\n");
        break;
      case "bookings":
        filename = `Booking_Report_${format(new Date(), "yyyyMMdd")}.csv`;
        csvContent = [
          "Booking ID,Customer,Product,Date,Status,Amount",
          ...filteredBookings.map(
            (booking) =>
              `${booking._id?.toString().substring(0, 8) || "N/A"},${
                booking.customerName || "N/A"
              },${booking.productName || "N/A"},${format(
                new Date(booking.createdAt),
                "yyyy-MM-dd"
              )},${booking.status},${booking.totalPrice}`
          ),
        ].join("\n");
        break;
      default:
        filename = `Full_Report_${format(new Date(), "yyyyMMdd")}.csv`;
        csvContent = [
          "Report Type,Value",
          `Total Revenue,${totalRevenue}`,
          `Total Bookings,${totalBookings}`,
          `Active Customers,${activeCustomers}`,
          `Average Booking Value,${averageBookingValue.toFixed(2)}`,
          "",
          "Monthly Revenue",
          "Month,Revenue,Bookings",
          ...revenueChartData.map(
            ({ month, revenue, bookings }) => `${month},${revenue},${bookings}`
          ),
          "",
          "Product Inventory",
          "Product Name,Category,Stock,Status,Base Price",
          ...products.map(
            (product) =>
              `${product.name},"${
                product.tags?.join(", ") || "Uncategorized"
              }",${product.stock}/${product.totalStock},${
                product.stock === 0
                  ? "Out of Stock"
                  : product.stock < (product.totalStock || 0) * 0.2
                  ? "Low Stock"
                  : "In Stock"
              },${product.basePrice}/${product.unit}`
          ),
        ].join("\n");
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Report Exported",
      description: `${filename} has been downloaded successfully.`,
    });
  };

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div
            className={`flex items-center text-xs ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}>
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {change}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={reportRef}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Track your business performance and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="bookings">Bookings</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="print-section">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Date Range:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal bg-transparent",
                      !dateRange.from && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(range: any) =>
                      setDateRange(range || { from: undefined, to: undefined })
                    }
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                setDateRange({ from: subDays(new Date(), 30), to: new Date() })
              }>
              Last 30 Days
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setDateRange({
                  from: startOfMonth(new Date()),
                  to: endOfMonth(new Date()),
                })
              }>
              This Month
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 print-section">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          change={12.5}
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          change={8.2}
          trend="up"
          icon={CalendarIcon}
        />
        <StatCard
          title="Active Customers"
          value={activeCustomers}
          change={-2.1}
          trend="down"
          icon={Users}
        />
        <StatCard
          title="Avg. Booking Value"
          value={`₹${averageBookingValue.toFixed(0)}`}
          change={5.7}
          trend="up"
          icon={Package}
        />
      </div>

      {(reportType === "overview" || reportType === "revenue") && (
        <Card className="print-section">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue and booking count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="chart-container" style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "revenue" ? `₹${value}` : value,
                      name === "revenue" ? "Revenue" : "Bookings",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar dataKey="bookings" fill="#82ca9d" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {(reportType === "overview" || reportType === "inventory") && (
        <Card className="print-section">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Product distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="chart-container" style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value">
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${value} products`,
                      "Count",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {(reportType === "overview" || reportType === "inventory") && (
        <Card className="print-section">
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>
              Products with highest booking frequency and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product, index) => (
                  <TableRow key={product.name}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.bookings}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{product.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={
                          index < 2
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }>
                        {index < 2 ? "Excellent" : "Good"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {(reportType === "overview" || reportType === "bookings") && (
        <Card className="print-section">
          <CardHeader>
            <CardTitle>Booking Status Overview</CardTitle>
            <CardDescription>Current status of all bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(bookingStatusData).map(([status, count]) => (
                <div key={status} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold mb-2">{count}</div>
                  <Badge
                    className={
                      statusColors[status] || "bg-gray-100 text-gray-800"
                    }>
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="print-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Reports
          </CardTitle>
          <CardDescription>
            Download detailed reports in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => handleExportCSV("revenue")}>
              <Download className="h-4 w-4 mr-2" />
              Revenue (CSV)
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportCSV("inventory")}>
              <Download className="h-4 w-4 mr-2" />
              Inventory (CSV)
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportCSV("bookings")}>
              <Download className="h-4 w-4 mr-2" />
              Bookings (CSV)
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Full Report (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
