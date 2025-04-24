const express = require("express")
const router = express.Router()
const {
  createResponse,
  getResponseById,
  updateResponse,
  deleteResponse,
} = require("../controllers/documentResponse.controller")
const auth = require("../middleware/auth")

// Create a new response
router.post("/", auth, createResponse)

// Get response by ID
router.get("/:id", auth, getResponseById)

// Update response
router.put("/:id", auth, updateResponse)

// Delete response
router.delete("/:id", auth, deleteResponse)

module.exports = router
