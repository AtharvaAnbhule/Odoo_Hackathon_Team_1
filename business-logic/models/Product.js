const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: String,
        alt: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
    },
    unit: {
      type: String,
      enum: ["hour", "day", "week", "month"],
      default: "day",
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    totalStock: {
      type: Number,
      required: [true, "Total stock is required"],
      min: [0, "Total stock cannot be negative"],
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    specifications: {
      type: Map,
      of: String,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    isRentable: {
      type: Boolean,
      default: true,
    },
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "damaged"],
      default: "excellent",
    },
    location: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    popularity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maintenanceSchedule: {
      type: String,
      trim: true,
    },
    lastMaintenance: {
      type: Date,
    },
    nextMaintenance: {
      type: Date,
    },
    qrCode: {
      type: String,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1 });
productSchema.index({ isRentable: 1, isActive: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ popularity: -1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for availability
productSchema.virtual("isAvailable").get(function () {
  return this.stock > 0 && this.isRentable && this.isActive;
});

// Virtual for stock percentage
productSchema.virtual("stockPercentage").get(function () {
  if (this.totalStock === 0) return 0;
  return Math.round((this.stock / this.totalStock) * 100);
});

// Virtual for bookings
productSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "product",
});

// Pre-save middleware to generate QR code
productSchema.pre("save", function (next) {
  if (!this.qrCode) {
    this.qrCode = `QR${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Method to update stock
productSchema.methods.updateStock = function (
  quantity,
  operation = "subtract"
) {
  if (operation === "subtract") {
    this.stock = Math.max(0, this.stock - quantity);
  } else if (operation === "add") {
    this.stock = Math.min(this.totalStock, this.stock + quantity);
  }
  return this.save();
};

// Method to check availability for booking
productSchema.methods.checkAvailability = function (
  quantity,
  startDate,
  endDate
) {
  // This would typically check against existing bookings
  // For now, just check stock
  return this.stock >= quantity && this.isAvailable;
};

module.exports = mongoose.model("Product", productSchema);
