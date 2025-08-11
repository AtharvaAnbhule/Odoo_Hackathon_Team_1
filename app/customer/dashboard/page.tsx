"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { CustomerDashboard } from "@/components/dashboard/customer-dashboard"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function CustomerDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading || !user || user.role !== "customer") {
    return <LoadingSpinner />
  }

  return (
    <DashboardLayout requiredRole="customer">
      <CustomerDashboard />
    </DashboardLayout>
  )
}
