const express = require("express")
const router = express.Router()
const {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  approveSchedule,
  deleteSchedule,
  getScheduleEvents,
} = require("../controllers/schedule.controller")
const auth = require("../middleware/auth")
const checkRole = require("../middleware/checkRole")

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
router.post("/:id/approve", auth, checkRole(["department_head", "manager"]), approveSchedule)

// Delete schedule
router.delete("/:id", auth, deleteSchedule)

module.exports = router
