const crypto = require("crypto")
const nodemailer = require("nodemailer")

// Generate random string
const generateRandomString = (length = 10) => {
  return crypto.randomBytes(length).toString("hex")
}

// Generate QR code data
const generateQRCode = (data) => {
  return `QR_${Date.now()}_${generateRandomString(8)}`
}

// Calculate rental duration in days
const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Calculate pricing
const calculatePricing = (basePrice, quantity, duration, discountPercent = 10, taxPercent = 9) => {
  const subtotal = basePrice * quantity * duration
  const discountAmount = (subtotal * discountPercent) / 100
  const taxableAmount = subtotal - discountAmount
  const taxAmount = (taxableAmount * taxPercent) / 100
  const totalPrice = taxableAmount + taxAmount
  const securityDeposit = basePrice * quantity * 0.5

  return {
    subtotal,
    discountAmount,
    taxAmount,
    totalPrice,
    securityDeposit,
  }
}

// Format currency
const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format date
const formatDate = (date, locale = "en-IN") => {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Indian format)
const isValidPhone = (phone) => {
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\s|-/g, ""))
}

// Generate slug from string
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// Paginate results
const paginate = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, Number.parseInt(page))
  const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit)))
  const skip = (pageNum - 1) * limitNum

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  }
}

// Create email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// Send email
const sendEmail = async (to, subject, html, text = null) => {
  try {
    const transporter = createEmailTransporter()

    const mailOptions = {
      from: `"${process.env.FROM_NAME || "Rental Management"}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.messageId)
    return info
  } catch (error) {
    console.error("Email sending failed:", error)
    throw error
  }
}

// Generate booking confirmation email
const generateBookingConfirmationEmail = (booking, customer, product) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Booking Confirmation</h2>
      <p>Dear ${customer.name},</p>
      <p>Your booking has been confirmed! Here are the details:</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Product:</strong> ${product.name}</p>
        <p><strong>Quantity:</strong> ${booking.quantity}</p>
        <p><strong>Pickup Date:</strong> ${formatDate(booking.startDate)}</p>
        <p><strong>Return Date:</strong> ${formatDate(booking.endDate)}</p>
        <p><strong>Total Amount:</strong> ${formatCurrency(booking.totalPrice)}</p>
      </div>
      
      <p>We'll contact you 24 hours before your pickup date with detailed instructions.</p>
      <p>Thank you for choosing our rental service!</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          If you have any questions, please contact us at support@rental.com or call +91 9876543210
        </p>
      </div>
    </div>
  `
}

// Check if date is in the past
const isPastDate = (date) => {
  return new Date(date) < new Date()
}

// Check if date is today
const isToday = (date) => {
  const today = new Date()
  const checkDate = new Date(date)
  return checkDate.toDateString() === today.toDateString()
}

// Get days between dates
const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input
  return input.trim().replace(/[<>]/g, "")
}

// Generate API response
const apiResponse = (success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
  }

  if (data !== null) {
    response.data = data
  }

  if (meta !== null) {
    response.meta = meta
  }

  return response
}

module.exports = {
  generateRandomString,
  generateQRCode,
  calculateDuration,
  calculatePricing,
  formatCurrency,
  formatDate,
  isValidEmail,
  isValidPhone,
  generateSlug,
  paginate,
  sendEmail,
  generateBookingConfirmationEmail,
  isPastDate,
  isToday,
  getDaysBetween,
  sanitizeInput,
  apiResponse,
}
