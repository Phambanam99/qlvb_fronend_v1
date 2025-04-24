const express = require("express")
const router = express.Router()
const {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  approveDocument,
  deleteDocument,
} = require("../controllers/outgoingDocument.controller")
const auth = require("../middleware/auth")
const checkRole = require("../middleware/checkRole")

// Get all documents
router.get("/", auth, getAllDocuments)

// Get document by ID
router.get("/:id", auth, getDocumentById)

// Create a new document
router.post("/", auth, createDocument)

// Update document
router.put("/:id", auth, updateDocument)

// Approve document (department_head or manager)
router.post("/:id/approve", auth, checkRole(["department_head", "manager"]), approveDocument)

// Delete document (creator or admin)
router.delete("/:id", auth, deleteDocument)

module.exports = router
