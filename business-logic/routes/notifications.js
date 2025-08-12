const express = require("express")
const Notification = require("../models/Notification")
const { protect } = require("../middleware/auth")
const { validateObjectId, validatePagination } = require("../middleware/validation")

const router = express.Router()

// Apply protection to all routes
router.use(protect)

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get("/", validatePagination, async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const query = { user: req.user.id }

    if (req.query.isRead !== undefined) {
      query.isRead = req.query.isRead === "true"
    }

    if (req.query.type) {
      query.type = req.query.type
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    })

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / limit),
      notifications,
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
router.patch("/:id/read", validateObjectId(), async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      })
    }

    await notification.markAsRead()

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
router.patch("/read-all", async (req, res, next) => {
  try {
    await Notification.markAllAsRead(req.user.id)

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete("/:id", validateObjectId(), async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      })
    }

    await notification.deleteOne()

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
router.post("/", async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create notifications",
      })
    }

    const { userId, title, message, type, actionUrl, metadata } = req.body

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "User ID, title, and message are required",
      })
    }

    const notification = await Notification.createNotification(userId, title, message, type, actionUrl, metadata)

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification,
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
