const { body, param, query, validationResult } = require("express-validator")

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// User validation rules
const validateUserRegistration = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("role").optional().isIn(["customer", "staff", "admin"]).withMessage("Invalid role"),
  body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  handleValidationErrors,
]

const validateUserLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
]

// Product validation rules
const validateProduct = [
  body("name").trim().isLength({ min: 2, max: 200 }).withMessage("Product name must be between 2 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("category").isMongoId().withMessage("Invalid category ID"),
  body("basePrice").isFloat({ min: 0 }).withMessage("Base price must be a positive number"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("totalStock").isInt({ min: 0 }).withMessage("Total stock must be a non-negative integer"),
  body("unit").isIn(["hour", "day", "week", "month"]).withMessage("Invalid unit"),
  body("condition").isIn(["excellent", "good", "fair", "damaged"]).withMessage("Invalid condition"),
  handleValidationErrors,
]

// Booking validation rules
const validateBooking = [
  body("product").isMongoId().withMessage("Invalid product ID"),
  body("startDate").isISO8601().toDate().withMessage("Invalid start date"),
  body("endDate").isISO8601().toDate().withMessage("Invalid end date"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("pickupLocation")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Pickup location cannot exceed 200 characters"),
  body("returnLocation")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Return location cannot exceed 200 characters"),
  handleValidationErrors,
]

// Category validation rules
const validateCategory = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Category name must be between 2 and 100 characters"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("parentId").optional().isMongoId().withMessage("Invalid parent category ID"),
  handleValidationErrors,
]

// Common validation rules
const validateObjectId = (field = "id") => [
  param(field).isMongoId().withMessage(`Invalid ${field}`),
  handleValidationErrors,
]

const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
]

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateProduct,
  validateBooking,
  validateCategory,
  validateObjectId,
  validatePagination,
}
