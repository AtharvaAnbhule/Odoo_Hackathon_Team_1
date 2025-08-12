const express = require("express");
const Product = require("../models/Product");
const Category = require("../models/Category");
const { protect, authorize } = require("../middleware/auth");
const {
  validateProduct,
  validateObjectId,
  validatePagination,
} = require("../middleware/validation");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, data: products });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

router.get("/:id", validateObjectId(), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug description"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      basePrice,
      unit = "day",
      stock,
      totalStock,
      amenities = [],
      specifications = {},
      notes = "",
      isRentable = true,
      condition = "excellent",
      location = "",
      tags = [],
      maintenanceSchedule,
      lastMaintenance,
      nextMaintenance,
      isActive = true,
    } = req.body;

    if (
      !name ||
      !description ||
      !basePrice ||
      stock === undefined ||
      totalStock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description, basePrice, stock, and totalStock are required",
      });
    }

    if (stock > totalStock) {
      return res.status(400).json({
        success: false,
        message: "Current stock cannot exceed total stock",
      });
    }

    const productData = {
      name,
      description,
      category,
      subcategory,
      basePrice,
      unit,
      stock,
      totalStock,
      amenities: amenities.filter((a) => a.trim() !== ""),
      specifications: Object.entries(specifications).reduce(
        (acc, [key, value]) => {
          if (key.trim() && value.trim()) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        },
        {}
      ),
      notes,
      isRentable,
      condition,
      location,
      tags: tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag !== ""),
      maintenanceSchedule,
      lastMaintenance,
      nextMaintenance,
      isActive,

      images: req.body.images || [
        {
          url: "/placeholder.svg?height=400&width=600&text=New+Product",
          alt: name,
          isPrimary: true,
        },
      ],
    };

    const product = await Product.create(productData);

    await product.populate("category", "name slug");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with similar unique fields already exists",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    next(error);
  }
});

router.put(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId(),
  async (req, res, next) => {
    try {
      if (req.body.category) {
        const category = await Category.findById(req.body.category);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: "Invalid category",
          });
        }
      }

      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).populate("category", "name slug");

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId(),
  async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      await product.deleteOne();

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:id/stock",
  protect,
  authorize("admin", "staff"),
  validateObjectId(),
  async (req, res, next) => {
    try {
      const { quantity, operation = "set" } = req.body;

      if (typeof quantity !== "number" || quantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid quantity",
        });
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      switch (operation) {
        case "add":
          product.stock = Math.min(
            product.totalStock,
            product.stock + quantity
          );
          break;
        case "subtract":
          product.stock = Math.max(0, product.stock - quantity);
          break;
        case "set":
          product.stock = Math.min(product.totalStock, Math.max(0, quantity));
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid operation. Use add, subtract, or set",
          });
      }

      await product.save();

      res.status(200).json({
        success: true,
        message: "Stock updated successfully",
        product: {
          id: product._id,
          name: product.name,
          stock: product.stock,
          totalStock: product.totalStock,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:id/availability", validateObjectId(), async (req, res, next) => {
  try {
    const { quantity = 1, startDate, endDate } = req.query;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const isAvailable = product.checkAvailability(
      Number.parseInt(quantity),
      startDate ? new Date(startDate) : new Date(),
      endDate ? new Date(endDate) : new Date()
    );

    res.status(200).json({
      success: true,
      available: isAvailable,
      stock: product.stock,
      totalStock: product.totalStock,
      requestedQuantity: Number.parseInt(quantity),
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/admin/stats",
  protect,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const totalProducts = await Product.countDocuments();
      const activeProducts = await Product.countDocuments({
        isActive: true,
        isRentable: true,
      });
      const outOfStock = await Product.countDocuments({ stock: 0 });
      const lowStock = await Product.countDocuments({
        $expr: { $lt: ["$stock", { $multiply: ["$totalStock", 0.2] }] },
      });

      const productsByCategory = await Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo",
          },
        },
        { $unwind: "$categoryInfo" },
        { $group: { _id: "$categoryInfo.name", count: { $sum: 1 } } },
      ]);

      const topRatedProducts = await Product.find({ rating: { $gte: 4 } })
        .select("name rating reviewCount")
        .sort({ rating: -1, reviewCount: -1 })
        .limit(5);

      res.status(200).json({
        success: true,
        stats: {
          totalProducts,
          activeProducts,
          outOfStock,
          lowStock,
          productsByCategory,
          topRatedProducts,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
