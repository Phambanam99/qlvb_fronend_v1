import express from "express"
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  approveDocument,
  deleteDocument,
} from "../controllers/outgoingDocument.controller"
import auth from "../middleware/auth"
import checkRole from "../middleware/checkRole"

const router = express.Router()

// Get all documents
router.get("/", auth, getAllDocuments)

// Get document by ID
router.get("/:id", auth, getDocumentById)

// Create a new document
router.post("/", auth, createDocument)

// Update document
router.put("/:id", auth, updateDocument)

// Approve document (department_head or manager)
router.post("/:id/approve", auth, checkRole(["department_head", "manager", "admin"]), approveDocument)

// Delete document
router.delete("/:id", auth, deleteDocument)

export default router
