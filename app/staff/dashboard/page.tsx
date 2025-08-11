"use client"

import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StaffDashboard } from "@/components/dashboard/staff-dashboard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function StaffDashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user || user.role !== "staff") {
    return <LoadingSpinner />
  }

  return (
    <DashboardLayout requiredRole="staff">
      <StaffDashboard />
    </DashboardLayout>
  )
}
