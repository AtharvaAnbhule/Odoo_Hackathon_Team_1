"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect to role-specific dashboard
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard")
          break
        case "staff":
          router.push("/staff/dashboard")
          break
        case "customer":
          router.push("/customer/dashboard")
          break
        default:
          router.push("/auth/login")
      }
    } else if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  return <LoadingSpinner />
}
