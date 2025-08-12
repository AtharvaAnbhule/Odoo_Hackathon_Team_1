const express = require("express")
const crypto = require("crypto")
const User = require("../models/User")
const { protect, generateToken } = require("../middleware/auth")
const { validateUserRegistration, validateUserLogin } = require("../middleware/validation")

const router = express.Router()

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", validateUserRegistration, async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
      phone,
      address,
    })

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", validateUserLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Check for user and include password
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      })
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        phone: user.phone,
        address: user.address,
        profilePicture: user.profilePicture,
      },
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        emergencyContact: user.emergencyContact,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      })
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`

    // In a real application, you would send an email here
    // For now, we'll just return the reset token
    res.status(200).json({
      success: true,
      message: "Password reset token generated",
      resetToken, // Remove this in production
      resetUrl, // Remove this in production
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
router.put("/reset-password/:resettoken", async (req, res, next) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      })
    }

    // Get hashed token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex")

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      })
    }

    // Set new password
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      token,
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
router.put("/update-password", protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      })
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password")

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    user.password = newPassword
    await user.save()

    // Generate new token
    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      token,
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post("/logout", protect, async (req, res, next) => {
  try {
    // In a real application with refresh tokens, you would invalidate the token here
    // For JWT, we just send a success response as the client will remove the token

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
