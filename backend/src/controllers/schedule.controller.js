const Schedule = require("../models/Schedule")

// Get all schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("creator", "fullName")
      .populate("approver", "fullName")
      .sort({ createdAt: -1 })
    res.json(schedules)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate("creator", "fullName")
      .populate("approver", "fullName")

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    res.json(schedule)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get schedule events
exports.getScheduleEvents = async (req, res) => {
  try {
    const { startDate, endDate, department, type } = req.query

    // Build query
    const query = { status: "approved" }

    if (startDate && endDate) {
      query["items.date"] = { $gte: new Date(startDate), $lte: new Date(endDate) }
    }

    if (department && department !== "all") {
      query.department = department
    }

    // Get schedules
    const schedules = await Schedule.find(query).populate("creator", "fullName").sort({ "items.date": 1 })

    // Extract and format events
    const events = []
    schedules.forEach((schedule) => {
      schedule.items.forEach((item) => {
        // Filter by type if specified
        if (type && type !== "all" && item.type !== type) {
          return
        }

        events.push({
          id: item._id,
          scheduleId: schedule._id,
          title: item.title,
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
          location: item.location,
          type: item.type,
          participants: item.participants,
          description: item.description,
          department: schedule.department,
          creator: schedule.creator,
        })
      })
    })

    // Sort events by date and time
    events.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB
      }
      return a.startTime.localeCompare(b.startTime)
    })

    res.json(events)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const { title, department, period, startDate, endDate, description, items } = req.body

    // Create new schedule
    const schedule = new Schedule({
      title,
      department,
      period: period || "week",
      startDate,
      endDate,
      description,
      items: items || [],
      creator: req.user._id,
      status: "pending",
    })

    await schedule.save()

    res.status(201).json({
      message: "Schedule created successfully",
      schedule,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { title, department, period, startDate, endDate, description, items, status } = req.body

    // Find schedule by id
    const schedule = await Schedule.findById(req.params.id)
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    // Check if user is the creator or has appropriate role
    if (
      schedule.creator.toString() !== req.user._id.toString() &&
      !["department_head", "manager", "admin"].includes(req.user.role)
    ) {
      return res.status(403).json({ message: "Not authorized to update this schedule" })
    }

    // Only allow updates to pending schedules unless user is admin
    if (schedule.status !== "pending" && req.user.role !== "admin") {
      return res.status(400).json({ message: "Only pending schedules can be updated" })
    }

    // Update schedule fields
    schedule.title = title || schedule.title
    schedule.department = department || schedule.department
    schedule.period = period || schedule.period
    schedule.startDate = startDate || schedule.startDate
    schedule.endDate = endDate || schedule.endDate
    schedule.description = description || schedule.description

    // Update items if provided
    if (items && items.length > 0) {
      schedule.items = items
    }

    // Update status if provided and user has permission
    if (status && ["department_head", "manager", "admin"].includes(req.user.role)) {
      schedule.status = status
    }

    schedule.updatedAt = Date.now()

    await schedule.save()

    res.json({
      message: "Schedule updated successfully",
      schedule,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Approve schedule
exports.approveSchedule = async (req, res) => {
  try {
    const { status, comments } = req.body

    // Find schedule by id
    const schedule = await Schedule.findById(req.params.id)
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    // Check if schedule is in pending status
    if (schedule.status !== "pending") {
      return res.status(400).json({ message: "Schedule is not in pending status" })
    }

    // Update schedule status
    schedule.status = status
    schedule.comments = comments || ""
    schedule.approver = req.user._id

    if (status === "approved") {
      schedule.approvedAt = Date.now()
    }

    schedule.updatedAt = Date.now()

    await schedule.save()

    res.json({
      message: "Schedule approval status updated successfully",
      schedule,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    // Check if user is the creator or admin
    if (schedule.creator.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this schedule" })
    }

    // Only allow deletion of pending schedules unless user is admin
    if (schedule.status !== "pending" && req.user.role !== "admin") {
      return res.status(400).json({ message: "Only pending schedules can be deleted" })
    }

    await Schedule.findByIdAndDelete(req.params.id)
    res.json({ message: "Schedule deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
