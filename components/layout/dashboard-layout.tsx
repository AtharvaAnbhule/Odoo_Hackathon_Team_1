"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "./navbar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: "admin" | "customer" | "staff"
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <LoadingSpinner />
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={logout} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
