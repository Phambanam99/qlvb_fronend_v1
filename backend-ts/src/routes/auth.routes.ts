import express from "express"
import { body } from "express-validator"
import { register, login, getCurrentUser } from "../controllers/auth.controller"
import auth from "../middleware/auth"

const router = express.Router()

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

export default router
