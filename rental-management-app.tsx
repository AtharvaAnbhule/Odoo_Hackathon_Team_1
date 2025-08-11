"use client";

import { useState, useEffect } from "react";
import { Navbar } from "./components/layout/navbar";
import { LoginForm } from "./components/auth/login-form";
import { AdminDashboard } from "./components/dashboard/admin-dashboard";
import { CustomerDashboard } from "./components/dashboard/customer-dashboard";
import { StaffDashboard } from "./components/dashboard/staff-dashboard";
import { ProductCatalog } from "./components/products/product-catalog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/auth";
import { Package, Calendar, Star, ArrowRight } from "lucide-react";

export default function RentalManagementApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setCurrentPage("dashboard");
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setCurrentPage("home");
  };

  const handleBookProduct = (productId: string) => {
    alert(`Booking product ${productId}`);
  };

  const renderDashboard = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case "admin":
        return <AdminDashboard />;
      case "customer":
        return <CustomerDashboard />;
      case "staff":
        return <StaffDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  const HomePage = () => (
    <div className="space-y-12">
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl" />
        <div className="relative px-8 py-16 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Rent Anything, Anytime
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Professional rental management platform for equipment, tools, and
              more
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100">
                <Package className="mr-2 h-5 w-5" />
                Browse Products
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Wide Selection</CardTitle>
            <CardDescription>
              Choose from thousands of quality products across multiple
              categories
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Easy Booking</CardTitle>
            <CardDescription>
              Simple booking process with flexible pickup and return options
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>Quality Service</CardTitle>
            <CardDescription>
              Professional service with maintenance and support included
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="bg-muted rounded-2xl p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
            <div className="text-muted-foreground">Products Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">5000+</div>
            <div className="text-muted-foreground">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
            <div className="text-muted-foreground">Categories</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-muted-foreground">Support Available</div>
          </div>
        </div>
      </section>

      <section className="text-center">
        <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <CardHeader>
            <CardTitle className="text-2xl mb-4">
              Ready to Get Started?
            </CardTitle>
            <CardDescription className="text-lg mb-6">
              Join thousands of satisfied customers and start renting today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setCurrentPage("login")}>
                Sign In
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={currentUser} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-6">
        {currentPage === "home" && !currentUser && <HomePage />}
        {currentPage === "login" && !currentUser && (
          <div className="max-w-md mx-auto mt-12">
            <LoginForm onLogin={handleLogin} />
          </div>
        )}
        {currentPage === "dashboard" && currentUser && renderDashboard()}
        {currentPage === "products" && (
          <ProductCatalog onBookProduct={handleBookProduct} />
        )}
      </main>
    </div>
  );
}
