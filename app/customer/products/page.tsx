"use client"

import { useState } from "react"
import { ProductCatalog } from "@/components/products/product-catalog"
import { BookingFlow } from "@/components/booking/booking-flow"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { DUMMY_PRODUCTS } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Product, Booking } from "@/lib/types"

export default function CustomerProductsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showBooking, setShowBooking] = useState(false)

  const handleBookProduct = (productId: string) => {
    const product = DUMMY_PRODUCTS.find((p) => p.id === productId)
    if (product) {
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please login to book products",
          variant: "destructive",
        })
        return
      }
      setSelectedProduct(product)
      setShowBooking(true)
    }
  }

  const handleBookingComplete = (booking: Booking) => {
    toast({
      title: "Booking Successful!",
      description: `Your booking for ${booking.productName} has been confirmed.`,
    })
    setShowBooking(false)
    setSelectedProduct(null)

    // Redirect to booking success page
    router.push(`/customer/booking-success?bookingId=${booking.id}`)
  }

  return (
    <DashboardLayout requiredRole="customer">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Browse Products</h1>
          <p className="text-muted-foreground">Find and book the perfect rental for your needs</p>
        </div>

        <ProductCatalog onBookProduct={handleBookProduct} />
      </div>

      {selectedProduct && (
        <BookingFlow
          open={showBooking}
          onOpenChange={setShowBooking}
          product={selectedProduct}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </DashboardLayout>
  )
}
