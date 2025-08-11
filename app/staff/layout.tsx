import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Staff Dashboard - RentalPro",
  description: "Staff dashboard for rental operations",
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
