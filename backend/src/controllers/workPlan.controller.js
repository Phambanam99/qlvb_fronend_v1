const WorkPlan = require("../models/WorkPlan")

// Get all work plans
exports.getAllWorkPlans = async (req, res) => {
  try {
    const workPlans = await WorkPlan.find()
      .populate("createdBy", "fullName")
      .populate("tasks.assignedTo", "fullName")
      .sort({ createdAt: -1 })
    res.json(workPlans)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get work plan by ID
exports.getWorkPlanById = async (req, res) => {
  try {
    const workPlan = await WorkPlan.findById(req.params.id)
      .populate("createdBy", "fullName")
      .populate("tasks.assignedTo", "fullName")

    if (!workPlan) {
      return res.status(404).json({ message: "Work plan not found" })
    }

    res.json(workPlan)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create a new work plan
exports.createWorkPlan = async (req, res) => {
  try {
    const { title, department, startDate, endDate, description, status, tasks, attachments } = req.body

    // Create new work plan
    const workPlan = new WorkPlan({
      title,
      department,
      startDate,
      endDate,
      description,
      status: status || "planned",
      tasks: tasks || [],
      attachments: attachments || [],
      createdBy: req.user._id,
    })

    await workPlan.save()

    res.status(201).json({
      message: "Work plan created successfully",
      workPlan,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update work plan
exports.updateWorkPlan = async (req, res) => {
  try {
    const { title, department, startDate, endDate, description, status, tasks, attachments } = req.body

    // Find work plan by id
    const workPlan = await WorkPlan.findById(req.params.id)
    if (!workPlan) {
      return res.status(404).json({ message: "Work plan not found" })
    }

    // Check if user is the creator or has appropriate role
    if (
      workPlan.createdBy.toString() !== req.user._id.toString() &&
      !["department_head", "manager", "admin"].includes(req.user.role)
    ) {
      return res.status(403).json({ message: "Not authorized to update this work plan" })
    }

    // Update work plan fields
    workPlan.title = title || workPlan.title
    workPlan.department = department || workPlan.department
    workPlan.startDate = startDate || workPlan.startDate
    workPlan.endDate = endDate || workPlan.endDate
    workPlan.description = description || workPlan.description
    workPlan.status = status || workPlan.status

    // Update tasks if provided
    if (tasks && tasks.length > 0) {
      workPlan.tasks = tasks
    }

    // Add new attachments if provided
    if (attachments && attachments.length > 0) {
      workPlan.attachments = [...workPlan.attachments, ...attachments]
    }

    workPlan.updatedAt = Date.now()

    await workPlan.save()

    res.json({
      message: "Work plan updated successfully",
      workPlan,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete work plan
exports.deleteWorkPlan = async (req, res) => {
  try {
    const workPlan = await WorkPlan.findById(req.params.id)
    if (!workPlan) {
      return res.status(404).json({ message: "Work plan not found" })
    }

    // Check if user is the creator or admin
    if (workPlan.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this work plan" })
    }

    await WorkPlan.findByIdAndDelete(req.params.id)
    res.json({ message: "Work plan deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
