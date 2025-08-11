"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  CalendarIcon,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  CalendarIcon as CalendarIconLucide,
  FileText,
  Filter,
} from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { cn } from "@/lib/utils"
import { DUMMY_BOOKINGS, DUMMY_PRODUCTS } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export function ReportsDashboard() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [reportType, setReportType] = useState("overview")

  // Calculate metrics
  const totalRevenue = DUMMY_BOOKINGS.reduce((sum, booking) => sum + booking.totalPrice, 0)
  const totalBookings = DUMMY_BOOKINGS.length
  const activeCustomers = new Set(DUMMY_BOOKINGS.map((b) => b.customerId)).size
  const averageBookingValue = totalRevenue / totalBookings

  // Revenue by month data
  const revenueData = [
    { month: "Jan", revenue: 45000, bookings: 120 },
    { month: "Feb", revenue: 52000, bookings: 140 },
    { month: "Mar", revenue: 48000, bookings: 130 },
    { month: "Apr", revenue: 61000, bookings: 165 },
    { month: "May", revenue: 55000, bookings: 150 },
    { month: "Jun", revenue: 67000, bookings: 180 },
  ]

  // Category distribution
  const categoryData = [
    { name: "Electronics", value: 35, color: "#8884d8" },
    { name: "Sports & Recreation", value: 25, color: "#82ca9d" },
    { name: "Audio & Visual", value: 20, color: "#ffc658" },
    { name: "Outdoor & Camping", value: 12, color: "#ff7300" },
    { name: "Tools & Equipment", value: 8, color: "#00ff00" },
  ]

  // Top products
  const topProducts = DUMMY_PRODUCTS.sort((a, b) => b.popularity - a.popularity)
    .slice(0, 5)
    .map((product) => ({
      name: product.name,
      bookings: Math.floor(product.popularity / 10),
      revenue: Math.floor(product.popularity * product.basePrice * 2.5),
      category: product.category,
    }))

  const handleExportReport = (type: string) => {
    toast({
      title: "Report Exported",
      description: `${type} report has been exported successfully.`,
    })
  }

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
          {trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          {change}% from last month
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Track your business performance and insights</p>
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
              <SelectItem value="customers">Customers</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExportReport(reportType)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
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
                      !dateRange.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
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
                    onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button variant="outline" onClick={() => setDateRange({ from: subDays(new Date(), 30), to: new Date() })}>
              Last 30 Days
            </Button>
            <Button
              variant="outline"
              onClick={() => setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })}
            >
              This Month
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          change={12.5}
          trend="up"
          icon={DollarSign}
        />
        <StatCard title="Total Bookings" value={totalBookings} change={8.2} trend="up" icon={CalendarIconLucide} />
        <StatCard title="Active Customers" value={activeCustomers} change={-2.1} trend="down" icon={Users} />
        <StatCard
          title="Avg. Booking Value"
          value={`₹${averageBookingValue.toFixed(0)}`}
          change={5.7}
          trend="up"
          icon={Package}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue and booking count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Booking distribution by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
          <CardDescription>Products with highest booking frequency and revenue</CardDescription>
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
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{product.bookings}</TableCell>
                  <TableCell className="text-right">₹{product.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={index < 2 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                      {index < 2 ? "Excellent" : "Good"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Status Overview</CardTitle>
          <CardDescription>Current status of all bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { status: "confirmed", count: 15, color: "bg-blue-100 text-blue-800" },
              { status: "picked-up", count: 8, color: "bg-orange-100 text-orange-800" },
              { status: "returned", count: 25, color: "bg-green-100 text-green-800" },
              { status: "overdue", count: 3, color: "bg-red-100 text-red-800" },
              { status: "cancelled", count: 2, color: "bg-gray-100 text-gray-800" },
            ].map((item) => (
              <div key={item.status} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold mb-2">{item.count}</div>
                <Badge className={item.color}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Reports
          </CardTitle>
          <CardDescription>Download detailed reports in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" onClick={() => handleExportReport("Revenue Report")}>
              <Download className="h-4 w-4 mr-2" />
              Revenue Report
            </Button>
            <Button variant="outline" onClick={() => handleExportReport("Inventory Report")}>
              <Download className="h-4 w-4 mr-2" />
              Inventory Report
            </Button>
            <Button variant="outline" onClick={() => handleExportReport("Customer Report")}>
              <Download className="h-4 w-4 mr-2" />
              Customer Report
            </Button>
            <Button variant="outline" onClick={() => handleExportReport("Booking Report")}>
              <Download className="h-4 w-4 mr-2" />
              Booking Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
