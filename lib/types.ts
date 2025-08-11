export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "customer" | "staff"
  profilePicture?: string
  phone?: string
  verified: boolean
  createdAt: string
  address?: string
  dateOfBirth?: string
  emergencyContact?: string
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  images: string[]
  basePrice: number
  unit: "hour" | "day" | "week" | "month"
  stock: number
  totalStock: number
  amenities: string[]
  specifications?: Record<string, string>
  notes?: string
  isRentable: boolean
  popularity: number
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
  tags: string[]
  location?: string
  condition: "excellent" | "good" | "fair"
  maintenanceSchedule?: string
  lastMaintenance?: string
  qrCode?: string
}

export interface Booking {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  productId: string
  productName: string
  startDate: string
  endDate: string
  quantity: number
  basePrice: number
  discountAmount: number
  taxAmount: number
  totalPrice: number
  status: "pending" | "confirmed" | "picked-up" | "returned" | "overdue" | "cancelled"
  paymentStatus: "pending" | "partial" | "paid" | "refunded"
  paymentAmount: number
  createdAt: string
  updatedAt: string
  notes?: string
  pickupLocation?: string
  returnLocation?: string
  staffAssigned?: string
  cancellationReason?: string
  lateFee?: number
  securityDeposit: number
  damageCharges?: number
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  method: "card" | "upi" | "bank" | "cash" | "wallet"
  status: "pending" | "completed" | "failed" | "refunded"
  transactionId: string
  gatewayResponse?: any
  createdAt: string
  refundAmount?: number
  refundReason?: string
}

export interface PriceRule {
  id: string
  name: string
  description?: string
  productId?: string
  categoryId?: string
  customerGroup: "all" | "vip" | "corporate" | "student"
  discountType: "percentage" | "fixed" | "bulk"
  discountValue: number
  minQuantity?: number
  minDuration?: number
  validFrom: string
  validTo: string
  isActive: boolean
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  parentId?: string
  isActive: boolean
  sortOrder: number
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export interface Report {
  id: string
  name: string
  type: "revenue" | "inventory" | "customer" | "booking"
  dateRange: {
    start: string
    end: string
  }
  filters: Record<string, any>
  data: any
  generatedAt: string
  generatedBy: string
}

export interface InventoryItem {
  id: string
  productId: string
  serialNumber: string
  condition: "excellent" | "good" | "fair" | "damaged"
  status: "available" | "rented" | "maintenance" | "retired"
  location: string
  purchaseDate: string
  purchasePrice: number
  currentValue: number
  lastMaintenance?: string
  nextMaintenance?: string
  notes?: string
}
