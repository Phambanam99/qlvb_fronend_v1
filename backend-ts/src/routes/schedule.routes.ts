import express from "express"
import {
  getAllSchedules,
  getScheduleById,
  getScheduleEvents,
  createSchedule,
  updateSchedule,
  approveSchedule,
  deleteSchedule,
} from "../controllers/schedule.controller"
import auth from "../middleware/auth"
import checkRole from "../middleware/checkRole"

const router = express.Router()

// Get all schedules
router.get("/", auth, getAllSchedules)

// Get schedule by ID
router.get("/:id", auth, getScheduleById)

// Get schedule events
router.get("/events", auth, getScheduleEvents)

// Create a new schedule
router.post("/", auth, createSchedule)

// Update schedule
router.put("/:id", auth, updateSchedule)

// Approve schedule (department_head or manager)
router.post("/:id/approve", auth, checkRole(["department_head", "manager", "admin"]), approveSchedule)

// Delete schedule
router.delete("/:id", auth, deleteSchedule)

export default router
