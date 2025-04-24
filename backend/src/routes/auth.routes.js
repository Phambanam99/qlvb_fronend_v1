const express = require("express")
const router = express.Router()
const { register, login, getCurrentUser } = require("../controllers/auth.controller")
const auth = require("../middleware/auth")
const { body } = require("express-validator")

// Register a new user
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("department").notEmpty().withMessage("Department is required"),
    body("position").notEmpty().withMessage("Position is required"),
  ],
  register,
)

// Login user
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login,
)

// Get current user
router.get("/me", auth, getCurrentUser)

module.exports = router
