"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Calendar,
  Star,
  ArrowRight,
  Shield,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  Smartphone,
  CreditCard,
  Headphones,
} from "lucide-react"
import { CATEGORIES, DUMMY_PRODUCTS } from "@/lib/data"
import Image from "next/image"

export function HomePage() {
  const featuredProducts = DUMMY_PRODUCTS.slice(0, 3)
  const stats = [
    { label: "Products Available", value: "1000+", icon: Package },
    { label: "Happy Customers", value: "5000+", icon: Users },
    { label: "Categories", value: "50+", icon: Star },
    { label: "Support Available", value: "24/7", icon: Clock },
  ]

  const features = [
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "All products are insured and regularly maintained for your safety",
    },
    {
      icon: Smartphone,
      title: "Easy Booking",
      description: "Book online or through our mobile app with just a few clicks",
    },
    {
      icon: CreditCard,
      title: "Flexible Payment",
      description: "Multiple payment options including cards, UPI, and digital wallets",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your rental needs",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">RentalPro</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#categories" className="text-sm font-medium hover:text-primary transition-colors">
              Categories
            </Link>
            <Link href="#products" className="text-sm font-medium hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 opacity-10" />
          <div className="container relative">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4" variant="secondary">
                🎉 New: Mobile App Now Available
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rent Anything, Anytime
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto">
                Professional rental management platform for equipment, tools, and more. Get what you need, when you need
                it, with our seamless booking experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="text-lg px-8">
                    <Package className="mr-2 h-5 w-5" />
                    Start Renting
                  </Button>
                </Link>
                <Link href="#products">
                  <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                    Browse Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose RentalPro?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We make renting easy, secure, and convenient with our comprehensive platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Categories</h2>
              <p className="text-xl text-muted-foreground">
                Find exactly what you need from our wide range of categories
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.slice(0, 6).map((category) => (
                <Card key={category.id} className="group hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-bold">{category.name}</h3>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardDescription>{category.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section id="products" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
              <p className="text-xl text-muted-foreground">Popular items that our customers love to rent</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div className="relative">
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 left-2 bg-green-100 text-green-800">Available</Badge>
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 rounded px-2 py-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">{product.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">{product.description}</CardDescription>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{product.category}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        {product.popularity}% popular
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold">₹{product.basePrice}</span>
                        <span className="text-sm text-muted-foreground ml-1">/{product.unit}</span>
                      </div>
                      <Link href="/auth/signup">
                        <Button size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/auth/signup">
                <Button size="lg">
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-xl text-muted-foreground">
                Don't just take our word for it - hear from our satisfied customers
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Event Planner",
                  content:
                    "RentalPro made organizing our corporate event so much easier. The sound system was perfect and the service was exceptional!",
                  rating: 5,
                },
                {
                  name: "Mike Chen",
                  role: "Photographer",
                  content:
                    "I regularly rent camera equipment for my projects. The quality is always top-notch and the booking process is seamless.",
                  rating: 5,
                },
                {
                  name: "Lisa Rodriguez",
                  role: "Adventure Enthusiast",
                  content:
                    "Great selection of outdoor gear! The camping equipment was in excellent condition and made our trip memorable.",
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <Card className="p-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
              <CardHeader>
                <CardTitle className="text-3xl md:text-4xl mb-4">Ready to Get Started?</CardTitle>
                <CardDescription className="text-xl text-blue-100 mb-8">
                  Join thousands of satisfied customers and start renting today. Sign up now and get 10% off your first
                  rental!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/signup">
                    <Button size="lg" variant="secondary" className="text-lg px-8">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Sign Up Free
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                    >
                      Already have an account?
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-muted py-16">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">RentalPro</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Professional rental management platform making equipment rental easy and accessible.
              </p>
              <div className="flex space-x-4">
                <Button size="sm" variant="outline">
                  Facebook
                </Button>
                <Button size="sm" variant="outline">
                  Twitter
                </Button>
                <Button size="sm" variant="outline">
                  LinkedIn
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  How It Works
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Electronics
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Sports & Recreation
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Tools & Equipment
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Party & Events
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Help Center
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 RentalPro. All rights reserved. Built with ❤️ for better rental experiences.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
