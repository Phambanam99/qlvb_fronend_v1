import express from "express"
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  assignDocument,
  deleteDocument,
} from "../controllers/incomingDocument.controller"
import auth from "../middleware/auth"
import checkRole from "../middleware/checkRole"

const router = express.Router()

// Get all documents
router.get("/", auth, getAllDocuments)

// Get document by ID
router.get("/:id", auth, getDocumentById)

// Create a new document (clerk only)
router.post("/", auth, checkRole(["clerk", "admin"]), createDocument)

// Update document
router.put("/:id", auth, updateDocument)

// Assign document to users (department_head or manager)
router.post("/:id/assign", auth, checkRole(["department_head", "manager", "admin"]), assignDocument)

// Delete document (admin or clerk)
router.delete("/:id", auth, checkRole(["admin", "clerk"]), deleteDocument)

export default router
