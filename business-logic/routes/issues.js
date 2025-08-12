const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");

// Create a new issue
router.post("/", async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    // Validate input
    if (!title || !description || !priority) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const issue = new Issue({
      title,
      description,
      priority,
      createdBy: "Issue created . ",
    });

    await issue.save();

    res.status(201).json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all issues for the current user
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find().sort({
      createdAt: -1,
    });

    res.json(issues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update issue status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
