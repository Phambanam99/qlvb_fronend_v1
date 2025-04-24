import express from "express"
import {
  createResponse,
  getResponseById,
  updateResponse,
  deleteResponse,
} from "../controllers/documentResponse.controller"
import auth from "../middleware/auth"

const router = express.Router()

// Create a new document response
router.post("/", auth, createResponse)

// Get response by ID
router.get("/:id", auth, getResponseById)

// Update response
router.put("/:id", auth, updateResponse)

// Delete response
router.delete("/:id", auth, deleteResponse)

export default router
