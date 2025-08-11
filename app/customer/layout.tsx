import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customer Dashboard - RentalPro",
  description: "Customer dashboard for rental bookings",
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
