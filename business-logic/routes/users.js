const express = require("express");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const {
  validateObjectId,
  validatePagination,
} = require("../middleware/validation");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Exclude sensitive fields from the response
    const users = await User.find({})
      .select(
        "-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
router.get("/:id", validateObjectId(), async (req, res, next) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this profile",
      });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", validateObjectId(), async (req, res, next) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile",
      });
    }

    const allowedFields = [
      "name",
      "phone",
      "address",
      "dateOfBirth",
      "emergencyContact",
    ];

    if (req.user.role === "admin") {
      allowedFields.push("role", "verified", "isActive");
    }

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/:id",
  authorize("admin"),
  validateObjectId(),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user._id.toString() === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete your own account",
        });
      }

      await user.deleteOne();

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/admin/stats", authorize("admin"), async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ verified: true });

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const recentUsers = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        usersByRole,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
