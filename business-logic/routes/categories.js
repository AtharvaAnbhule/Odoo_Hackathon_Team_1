const express = require("express");
const Category = require("../models/Category");
const { protect, authorize } = require("../middleware/auth");
const {
  validateCategory,
  validateObjectId,
  validatePagination,
} = require("../middleware/validation");

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get("/", validatePagination, async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    if (req.query.parentId) {
      query.parentId =
        req.query.parentId === "null" ? null : req.query.parentId;
    }

    const categories = await Category.find(query)
      .populate("subcategories")
      .populate("productCount")
      .sort({ sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Category.countDocuments(query);

    res.status(200).json({
      success: true,
      count: categories.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      categories,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get("/:id", validateObjectId(), async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate("subcategories")
      .populate("products");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
router.post("/", async (req, res, next) => {
  try {
    // If parentId is provided, verify it exists
    if (req.body.parentId) {
      const parentCategory = await Category.findById(req.body.parentId);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
        });
      }
    }

    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId(),
  async (req, res, next) => {
    try {
      // If parentId is being updated, verify it exists and isn't the same as current category
      if (req.body.parentId) {
        if (req.body.parentId === req.params.id) {
          return res.status(400).json({
            success: false,
            message: "Category cannot be its own parent",
          });
        }

        const parentCategory = await Category.findById(req.body.parentId);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: "Parent category not found",
          });
        }
      }

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        category,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId(),
  async (req, res, next) => {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Check if category has subcategories
      const subcategories = await Category.countDocuments({
        parentId: req.params.id,
      });
      if (subcategories > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete category with subcategories",
        });
      }

      // Check if category has products
      const Product = require("../models/Product");
      const products = await Product.countDocuments({
        category: req.params.id,
      });
      if (products > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete category with products",
        });
      }

      await category.deleteOne();

      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
router.get("/admin/tree", async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate("subcategories")
      .sort({ sortOrder: 1, name: 1 });

    // Build tree structure
    const tree = categories.filter((cat) => !cat.parentId);

    const buildTree = (parentCategories) => {
      return parentCategories.map((parent) => ({
        ...parent.toObject(),
        children: buildTree(
          categories.filter(
            (cat) =>
              cat.parentId && cat.parentId.toString() === parent._id.toString()
          )
        ),
      }));
    };

    const categoryTree = buildTree(tree);

    res.status(200).json({
      success: true,
      tree: categoryTree,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
