import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard - RentalPro",
  description: "Admin dashboard for rental management",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
