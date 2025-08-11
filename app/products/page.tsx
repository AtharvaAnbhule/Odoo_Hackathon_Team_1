"use client"

import { useState } from "react"
import { ProductCatalog } from "@/components/products/product-catalog"
import { BookingFlow } from "@/components/booking/booking-flow"
import { Navbar } from "@/components/layout/navbar"
import { useAuth } from "@/contexts/auth-context"
import { DUMMY_PRODUCTS } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import type { Product, Booking } from "@/lib/types"

export default function ProductsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
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
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={logout} />

      <main className="container mx-auto px-4 py-6">
        <ProductCatalog onBookProduct={handleBookProduct} />
      </main>

      {selectedProduct && (
        <BookingFlow
          open={showBooking}
          onOpenChange={setShowBooking}
          product={selectedProduct}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  )
}
