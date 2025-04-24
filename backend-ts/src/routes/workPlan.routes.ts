import express from "express"
import {
  getAllWorkPlans,
  getWorkPlanById,
  createWorkPlan,
  updateWorkPlan,
  deleteWorkPlan,
} from "../controllers/workPlan.controller"
import auth from "../middleware/auth"

const router = express.Router()

// Get all work plans
router.get("/", auth, getAllWorkPlans)

// Get work plan by ID
router.get("/:id", auth, getWorkPlanById)

// Create a new work plan
router.post("/", auth, createWorkPlan)

// Update work plan
router.put("/:id", auth, updateWorkPlan)

// Delete work plan
router.delete("/:id", auth, deleteWorkPlan)

export default router
