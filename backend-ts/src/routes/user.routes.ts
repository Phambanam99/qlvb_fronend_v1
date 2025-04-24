import express from "express"
import { body } from "express-validator"
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/user.controller"
import auth from "../middleware/auth"
import checkRole from "../middleware/checkRole"

const router = express.Router()

// Get all users
router.get("/", auth, getAllUsers)

// Get user by ID
router.get("/:id", auth, getUserById)

// Create a new user (admin only)
router.post(
  "/",
  [
    auth,
    checkRole(["admin"]),
    body("username").notEmpty().withMessage("Username is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("department").notEmpty().withMessage("Department is required"),
    body("position").notEmpty().withMessage("Position is required"),
  ],
  createUser,
)

// Update user (admin or self)
router.put("/:id", auth, updateUser)

// Delete user (admin only)
router.delete("/:id", auth, checkRole(["admin"]), deleteUser)

export default router
