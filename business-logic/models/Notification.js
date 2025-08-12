const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: [
        "info",
        "success",
        "warning",
        "error",
        "booking",
        "payment",
        "system",
      ],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  return this.save();
};

notificationSchema.statics.createNotification = function (
  userId,
  title,
  message,
  type = "info",
  actionUrl = null,
  metadata = {}
) {
  return this.create({
    user: userId,
    title,
    message,
    type,
    actionUrl,
    metadata,
  });
};

notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany({ user: userId, isRead: false }, { isRead: true });
};

module.exports = mongoose.model("Notification", notificationSchema);
