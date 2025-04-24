import type { Request, Response } from "express"
import WorkPlan from "../models/WorkPlan"
import User from "../models/User"

// Get all work plans
export const getAllWorkPlans = async (_req: Request, res: Response) => {
  try {
    const workPlans = await WorkPlan.findAll({
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    res.json(workPlans)
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get work plan by ID
export const getWorkPlanById = async (req: Request, res: Response) => {
  try {
    const workPlan = await WorkPlan.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName"],
        },
      ],
    })

    if (!workPlan) {
      return res.status(404).json({ message: "Work plan not found" })
    }

    res.json(workPlan)
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create a new work plan
export const createWorkPlan = async (req: Request, res: Response) => {
  try {
    const { title, department, startDate, endDate, description, status, tasks, attachments } = req.body

    // Create new work plan
    const workPlan = await WorkPlan.create({
      title,
      department,
      startDate,
      endDate,
      description,
      status: status || "planned",
      tasks: tasks || [],
      attachments: attachments || [],
      createdById: req.user.id,
    })

    // Get work plan with associations
    const createdWorkPlan = await WorkPlan.findByPk(workPlan.id, {
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName"],
        },
      ],
    })

    res.status(201).json({
      message: "Work plan created successfully",
      workPlan: createdWorkPlan,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update work plan
export const updateWorkPlan = async (req: Request, res: Response) => {
  try {
    const { title, department, startDate, endDate, description, status, tasks, attachments } = req.body

    // Find work plan by id
    const workPlan = await WorkPlan.findByPk(req.params.id)
    if (!workPlan) {
      return res.status(404).json({ message: "Work plan not found" })
    }

    // Check if user is the creator or has appropriate role
    if (workPlan.createdById !== req.user.id && !["department_head", "manager", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized to update this work plan" })
    }

    // Update work plan fields
    if (title) workPlan.title = title
    if (department) workPlan.department = department
    if (startDate) workPlan.startDate = startDate
    if (endDate) workPlan.endDate = endDate
    if (description) workPlan.description = description
    if (status) workPlan.status = status

    // Update tasks if provided
    if (tasks && tasks.length > 0) {
      workPlan.tasks = tasks
    }

    // Add new attachments if provided
    if (attachments && attachments.length > 0) {
      workPlan.attachments = [...workPlan.attachments, ...attachments]
    }

    await workPlan.save()

    // Get updated work plan with associations
    const updatedWorkPlan = await WorkPlan.findByPk(workPlan.id, {
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName"],
        },
      ],
    })

    res.json({
      message: "Work plan updated successfully",
      workPlan: updatedWorkPlan,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete work plan
export const deleteWorkPlan = async (req: Request, res: Response) => {
  try {
    const workPlan = await WorkPlan.findByPk(req.params.id)
    if (!workPlan) {
      return res.status(404).json({ message: "Work plan not found" })
    }

    // Check if user is the creator or admin
    if (workPlan.createdById !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this work plan" })
    }

    await workPlan.destroy()
    res.json({ message: "Work plan deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
