const express = require("express");
const Booking = require("../models/Booking");
const Product = require("../models/Product");
const User = require("../models/User");
const Notification = require("../models/Notification");
const {
  protect,
  authorize,
  authorizeOwnerOrAdmin,
} = require("../middleware/auth");
const {
  validateBooking,
  validateObjectId,
  validatePagination,
} = require("../middleware/validation");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { customerId, status, startDate, endDate } = req.query;

    const filter = {};
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;
    if (startDate) filter.startDate = { $gte: new Date(startDate) };
    if (endDate) filter.endDate = { $lte: new Date(endDate) };

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch bookings" });
  }
});

router.get("/:id", validateObjectId(), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name email phone address")
      .populate("product", "name description images basePrice unit")
      .populate("staffAssigned", "name email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      req.user.role === "customer" &&
      booking.customer._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this booking",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const { bookingData, customerData, product, pricing } = req.body;

    const booking = new Booking({
      customerId: req.user?.id || "guest",
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,

      productId: product.id,
      productName: product.name,
      productBasePrice: product.basePrice,

      startDate: new Date(bookingData.startDate),
      endDate: new Date(bookingData.endDate),
      quantity: bookingData.quantity,
      notes: bookingData.notes,
      pickupLocation: bookingData.pickupLocation,
      returnLocation: bookingData.returnLocation,

      baseAmount: pricing.baseAmount,
      discountAmount: pricing.discountAmount,
      taxAmount: pricing.taxAmount,
      totalPrice: pricing.totalPrice,
      securityDeposit: pricing.securityDeposit,
    });

    await booking.save();

    res.status(201).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create booking",
    });
  }
});

router.put(
  "/:id",
  authorize("admin", "staff"),
  validateObjectId(),
  async (req, res, next) => {
    try {
      const allowedFields = [
        "status",
        "paymentStatus",
        "staffAssigned",
        "notes",
        "returnNotes",
      ];

      const updateData = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).populate([
        { path: "customer", select: "name email phone" },
        { path: "product", select: "name images basePrice" },
      ]);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (req.body.status) {
        await Notification.createNotification(
          booking.customer._id,
          "Booking Status Updated",
          `Your booking status has been updated to ${req.body.status}.`,
          "booking",
          `/bookings/${booking._id}`
        );
      }

      res.status(200).json({
        success: true,
        message: "Booking updated successfully",
        booking,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch("/:id/cancel", validateObjectId(), async (req, res, next) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id).populate("product");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      req.user.role === "customer" &&
      booking.customer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    if (booking.status === "returned") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed booking",
      });
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason;
    await booking.save();

    if (booking.status !== "picked-up") {
      await booking.product.updateStock(booking.quantity, "add");
    }

    await Notification.createNotification(
      booking.customer,
      "Booking Cancelled",
      `Your booking has been cancelled. ${reason ? `Reason: ${reason}` : ""}`,
      "booking",
      `/bookings/${booking._id}`
    );

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/stats", authorize("admin"), async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({
      status: { $in: ["confirmed", "picked-up"] },
    });
    const overdueBookings = await Booking.countDocuments({
      status: "picked-up",
      endDate: { $lt: new Date() },
    });
    const pendingPayments = await Booking.countDocuments({
      paymentStatus: "pending",
    });

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const revenueStats = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          averageBookingValue: { $avg: "$totalPrice" },
        },
      },
    ]);

    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        activeBookings,
        overdueBookings,
        pendingPayments,
        bookingsByStatus,
        revenue: revenueStats[0] || { totalRevenue: 0, averageBookingValue: 0 },
        monthlyBookings,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
