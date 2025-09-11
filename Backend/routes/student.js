const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { authMiddleware, isAdmin } = require("../middleware");

const router = express.Router();

// Admin: Get all students
router.get("/", authMiddleware, async (req, res) => {
  const students = await User.find({ role: "student" }).select("-password");
  res.json(students);
});

// Admin: Add new student
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, email, password, course } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new User({
      name,
      email,
      password: hashedPassword,
      course,
      role: "student"
    });

    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: "Failed to add student" });
  }
});

// Admin: Update student
router.put("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password");
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Failed to update student" });
  }
});

// Admin: Delete student
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete student" });
  }
});

// Student: View own profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select("-password");
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Student: Update own profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    }).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;
