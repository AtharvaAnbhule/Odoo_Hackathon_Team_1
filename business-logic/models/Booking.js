const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerId: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,

  productId: String,
  productName: String,
  productBasePrice: Number,

  startDate: Date,
  endDate: Date,
  quantity: Number,
  notes: String,
  pickupLocation: String,
  returnLocation: String,

  baseAmount: Number,
  discountAmount: Number,
  taxAmount: Number,
  totalPrice: Number,
  securityDeposit: Number,

  status: {
    type: String,
    default: "pending",
    enum: ["pending", "confirmed", "completed", "cancelled"],
  },
  paymentStatus: {
    type: String,
    default: "pending",
    enum: ["pending", "paid", "refunded"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

bookingSchema.virtual("durationDays").get(function () {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model("Booking", bookingSchema);
