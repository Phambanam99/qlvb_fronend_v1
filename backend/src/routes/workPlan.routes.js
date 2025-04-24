const express = require("express")
const router = express.Router()
const {
  getAllWorkPlans,
  getWorkPlanById,
  createWorkPlan,
  updateWorkPlan,
  deleteWorkPlan,
} = require("../controllers/workPlan.controller")
const auth = require("../middleware/auth")
const checkRole = require("../middleware/checkRole")

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

module.exports = router
