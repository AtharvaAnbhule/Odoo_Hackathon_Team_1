const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const User = require("../models/User")
const Category = require("../models/Category")
const Product = require("../models/Product")
const Booking = require("../models/Booking")
const Notification = require("../models/Notification")

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/rental-management", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const seedData = async () => {
  try {
    console.log("🌱 Starting database seeding...")

    // Clear existing data
    await User.deleteMany({})
    await Category.deleteMany({})
    await Product.deleteMany({})
    await Booking.deleteMany({})
    await Notification.deleteMany({})

    console.log("🗑️  Cleared existing data")

    // Create Users
    const users = await User.create([
      {
        name: "Admin User",
        email: "admin@rental.com",
        password: "password123",
        role: "admin",
        phone: "+91 9876543210",
        address: "123 Admin Street, City, State 12345",
        verified: true,
        isActive: true,
      },
      {
        name: "Staff Member",
        email: "staff@rental.com",
        password: "password123",
        role: "staff",
        phone: "+91 9876543211",
        address: "456 Staff Avenue, City, State 12345",
        verified: true,
        isActive: true,
      },
      {
        name: "John Customer",
        email: "customer@rental.com",
        password: "password123",
        role: "customer",
        phone: "+91 9876543212",
        address: "789 Customer Lane, City, State 12345",
        dateOfBirth: new Date("1990-05-15"),
        emergencyContact: "+91 9876543213",
        verified: true,
        isActive: true,
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        role: "customer",
        phone: "+91 9876543214",
        address: "321 Smith Road, City, State 12345",
        verified: true,
        isActive: true,
      },
      {
        name: "Mike Johnson",
        email: "mike@example.com",
        password: "password123",
        role: "customer",
        phone: "+91 9876543215",
        address: "654 Johnson Street, City, State 12345",
        verified: false,
        isActive: true,
      },
    ])

    console.log("👥 Created users")

    // Create Categories
    const categories = await Category.create([
      {
        name: "Electronics",
        description: "Electronic devices and gadgets",
        image: "/images/categories/electronics.jpg",
        sortOrder: 1,
      },
      {
        name: "Sports & Recreation",
        description: "Sports equipment and recreational items",
        image: "/images/categories/sports.jpg",
        sortOrder: 2,
      },
      {
        name: "Audio & Visual",
        description: "Audio and visual equipment",
        image: "/images/categories/audio-visual.jpg",
        sortOrder: 3,
      },
      {
        name: "Outdoor & Camping",
        description: "Outdoor and camping gear",
        image: "/images/categories/outdoor.jpg",
        sortOrder: 4,
      },
      {
        name: "Tools & Equipment",
        description: "Professional tools and equipment",
        image: "/images/categories/tools.jpg",
        sortOrder: 5,
      },
      {
        name: "Party & Events",
        description: "Party and event supplies",
        image: "/images/categories/party.jpg",
        sortOrder: 6,
      },
    ])

    console.log("📂 Created categories")

    // Create Products
    const products = await Product.create([
      {
        name: "Professional DSLR Camera",
        description:
          "High-quality DSLR camera perfect for professional photography and videography. Includes multiple lenses and accessories.",
        category: categories[0]._id,
        subcategory: "Cameras",
        images: [{ url: "/images/products/dslr-camera.jpg", alt: "DSLR Camera", isPrimary: true }],
        basePrice: 150,
        unit: "day",
        stock: 5,
        totalStock: 8,
        amenities: ["Multiple Lenses", "Tripod", "Memory Cards", "Battery Pack", "Carrying Case"],
        specifications: {
          Resolution: "24.2 MP",
          "ISO Range": "100-25600",
          Video: "4K UHD",
          Weight: "755g",
        },
        condition: "excellent",
        location: "Warehouse A - Section 1",
        tags: ["photography", "professional", "dslr", "camera"],
        popularity: 85,
        rating: 4.8,
        reviewCount: 24,
        isRentable: true,
      },
      {
        name: "Mountain Bike",
        description:
          "High-performance mountain bike suitable for all terrains. Perfect for adventure enthusiasts and outdoor activities.",
        category: categories[1]._id,
        subcategory: "Bicycles",
        images: [{ url: "/images/products/mountain-bike.jpg", alt: "Mountain Bike", isPrimary: true }],
        basePrice: 80,
        unit: "day",
        stock: 12,
        totalStock: 15,
        amenities: ["Helmet", "Water Bottle", "Repair Kit", "Lock"],
        specifications: {
          "Frame Size": 'Medium (17")',
          Gears: "21-Speed",
          "Wheel Size": "26 inches",
          Weight: "15kg",
        },
        condition: "good",
        location: "Warehouse B - Section 2",
        tags: ["bike", "mountain", "outdoor", "sports"],
        popularity: 92,
        rating: 4.6,
        reviewCount: 18,
        isRentable: true,
      },
      {
        name: "Professional Sound System",
        description:
          "Complete professional sound system with speakers, mixer, and microphones. Perfect for events, parties, and presentations.",
        category: categories[2]._id,
        subcategory: "Sound Equipment",
        images: [{ url: "/images/products/sound-system.jpg", alt: "Sound System", isPrimary: true }],
        basePrice: 200,
        unit: "day",
        stock: 3,
        totalStock: 5,
        amenities: ["Wireless Microphones", "Mixer", "Cables", "Stands", "Remote Control"],
        specifications: {
          "Power Output": "1000W",
          "Frequency Response": "20Hz-20kHz",
          Channels: "8-Channel Mixer",
          Connectivity: "Bluetooth, USB, AUX",
        },
        condition: "excellent",
        location: "Warehouse A - Section 3",
        tags: ["audio", "sound", "professional", "events"],
        popularity: 78,
        rating: 4.7,
        reviewCount: 12,
        isRentable: true,
      },
      {
        name: "Camping Tent (4-Person)",
        description:
          "Spacious 4-person camping tent with waterproof material and easy setup. Ideal for family camping trips and outdoor adventures.",
        category: categories[3]._id,
        subcategory: "Tents",
        images: [{ url: "/images/products/camping-tent.jpg", alt: "Camping Tent", isPrimary: true }],
        basePrice: 60,
        unit: "day",
        stock: 8,
        totalStock: 10,
        amenities: ["Ground Sheet", "Stakes", "Guy Ropes", "Repair Kit", "Carrying Bag"],
        specifications: {
          Capacity: "4 Persons",
          Dimensions: "240 x 210 x 130 cm",
          Weight: "4.5kg",
          Material: "Polyester with PU Coating",
        },
        condition: "good",
        location: "Warehouse B - Section 1",
        tags: ["camping", "tent", "outdoor", "family"],
        popularity: 88,
        rating: 4.5,
        reviewCount: 15,
        isRentable: true,
      },
      {
        name: "Power Drill Set",
        description:
          "Professional cordless power drill set with multiple bits and accessories. Perfect for DIY projects and professional work.",
        category: categories[4]._id,
        subcategory: "Power Tools",
        images: [{ url: "/images/products/power-drill.jpg", alt: "Power Drill Set", isPrimary: true }],
        basePrice: 45,
        unit: "day",
        stock: 15,
        totalStock: 20,
        amenities: ["Drill Bits Set", "Screwdriver Bits", "Carrying Case", "Charger", "Extra Battery"],
        specifications: {
          Voltage: "18V",
          "Chuck Size": "13mm",
          Torque: "50 Nm",
          "Battery Life": "2-3 hours",
        },
        condition: "excellent",
        location: "Warehouse A - Section 2",
        tags: ["tools", "drill", "diy", "professional"],
        popularity: 75,
        rating: 4.4,
        reviewCount: 22,
        isRentable: true,
      },
      {
        name: "Party Lighting Kit",
        description:
          "Complete party lighting kit with LED lights, disco ball, and controller. Create the perfect ambiance for any celebration.",
        category: categories[5]._id,
        subcategory: "Lighting",
        images: [{ url: "/images/products/party-lights.jpg", alt: "Party Lighting Kit", isPrimary: true }],
        basePrice: 120,
        unit: "day",
        stock: 6,
        totalStock: 8,
        amenities: ["LED Strip Lights", "Disco Ball", "Controller", "Extension Cables", "Mounting Hardware"],
        specifications: {
          "LED Count": "300 LEDs",
          Colors: "RGB + White",
          Control: "Remote + App",
          Power: "50W",
        },
        condition: "excellent",
        location: "Warehouse B - Section 3",
        tags: ["party", "lighting", "led", "events"],
        popularity: 82,
        rating: 4.6,
        reviewCount: 19,
        isRentable: true,
      },
    ])

    console.log("📦 Created products")

    // Create Bookings
    const bookings = await Booking.create([
      {
        customer: users[2]._id, // John Customer
        product: products[0]._id, // DSLR Camera
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        quantity: 1,
        basePrice: 450, // 3 days * 150
        discountAmount: 45,
        taxAmount: 36.45,
        totalPrice: 441.45,
        securityDeposit: 75,
        status: "confirmed",
        paymentStatus: "paid",
        paymentAmount: 441.45,
        paymentMethod: "card",
        transactionId: "TXN123456789",
        notes: "Need for wedding photography",
        pickupLocation: "Main Store",
        returnLocation: "Main Store",
      },
      {
        customer: users[3]._id, // Jane Smith
        product: products[1]._id, // Mountain Bike
        startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        quantity: 2,
        basePrice: 320, // 2 days * 80 * 2 bikes
        discountAmount: 32,
        taxAmount: 25.92,
        totalPrice: 313.92,
        securityDeposit: 80,
        status: "picked-up",
        paymentStatus: "paid",
        paymentAmount: 313.92,
        paymentMethod: "upi",
        transactionId: "UPI987654321",
        notes: "Weekend cycling trip",
        pickupLocation: "Main Store",
        returnLocation: "Main Store",
      },
      {
        customer: users[4]._id, // Mike Johnson
        product: products[3]._id, // Camping Tent
        startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (overdue)
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        quantity: 1,
        basePrice: 120, // 2 days * 60
        discountAmount: 12,
        taxAmount: 9.72,
        totalPrice: 117.72,
        securityDeposit: 30,
        status: "overdue",
        paymentStatus: "paid",
        paymentAmount: 117.72,
        paymentMethod: "cash",
        notes: "Family camping trip",
        pickupLocation: "Main Store",
        returnLocation: "Main Store",
      },
    ])

    console.log("📋 Created bookings")

    // Create Notifications
    await Notification.create([
      {
        user: users[2]._id,
        title: "Booking Confirmed",
        message: "Your booking for Professional DSLR Camera has been confirmed.",
        type: "booking",
        actionUrl: `/bookings/${bookings[0]._id}`,
        isRead: false,
      },
      {
        user: users[3]._id,
        title: "Item Picked Up",
        message: "You have successfully picked up your Mountain Bike rental.",
        type: "booking",
        actionUrl: `/bookings/${bookings[1]._id}`,
        isRead: true,
      },
      {
        user: users[4]._id,
        title: "Return Overdue",
        message: "Your Camping Tent rental is overdue. Please return it as soon as possible.",
        type: "warning",
        actionUrl: `/bookings/${bookings[2]._id}`,
        isRead: false,
      },
      {
        user: users[0]._id,
        title: "System Update",
        message: "The rental management system has been updated with new features.",
        type: "system",
        isRead: false,
      },
    ])

    console.log("🔔 Created notifications")

    console.log("✅ Database seeding completed successfully!")
    console.log("\n📊 Summary:")
    console.log(`👥 Users: ${users.length}`)
    console.log(`📂 Categories: ${categories.length}`)
    console.log(`📦 Products: ${products.length}`)
    console.log(`📋 Bookings: ${bookings.length}`)
    console.log(`🔔 Notifications: 4`)

    console.log("\n🔐 Test Accounts:")
    console.log("Admin: admin@rental.com / password123")
    console.log("Staff: staff@rental.com / password123")
    console.log("Customer: customer@rental.com / password123")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seedData()
