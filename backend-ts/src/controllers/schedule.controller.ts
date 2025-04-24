import type { Request, Response } from "express"
import { Op } from "sequelize"
import Schedule from "../models/Schedule"
import User from "../models/User"

// Get all schedules
export const getAllSchedules = async (_req: Request, res: Response) => {
  try {
    const schedules = await Schedule.findAll({
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "fullName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    res.json(schedules)
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get schedule by ID
export const getScheduleById = async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "fullName"],
        },
      ],
    })

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    res.json(schedule)
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get schedule events
export const getScheduleEvents = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, department, type } = req.query

    // Build query
    const query: any = { status: "approved" }

    if (startDate && endDate) {
      query.startDate = { [Op.gte]: new Date(startDate as string) }
      query.endDate = { [Op.lte]: new Date(endDate as string) }
    }

    if (department && department !== "all") {
      query.department = department
    }

    // Get schedules
    const schedules = await Schedule.findAll({
      where: query,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName"],
        },
      ],
      order: [["startDate", "ASC"]],
    })

    // Extract and format events
    const events: any[] = []
    schedules.forEach((schedule) => {
      schedule.items.forEach((item: any) => {
        // Filter by type if specified
        if (type && type !== "all" && item.type !== type) {
          return
        }

        events.push({
          id: item.id || `${schedule.id}-${events.length}`,
          scheduleId: schedule.id,
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
        return dateA.getTime() - dateB.getTime()
      }
      return a.startTime.localeCompare(b.startTime)
    })

    res.json(events)
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create a new schedule
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const { title, department, period, startDate, endDate, description, items } = req.body

    // Create new schedule
    const schedule = await Schedule.create({
      title,
      department,
      period: period || "week",
      startDate,
      endDate,
      description,
      items: items || [],
      creatorId: req.user.id,
      status: "pending",
    })

    // Get schedule with associations
    const createdSchedule = await Schedule.findByPk(schedule.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName"],
        },
      ],
    })

    res.status(201).json({
      message: "Schedule created successfully",
      schedule: createdSchedule,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update schedule
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { title, department, period, startDate, endDate, description, items, status } = req.body

    // Find schedule by id
    const schedule = await Schedule.findByPk(req.params.id)
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    // Check if user is the creator or has appropriate role
    if (schedule.creatorId !== req.user.id && !["department_head", "manager", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized to update this schedule" })
    }

    // Only allow updates to pending schedules unless user is admin
    if (schedule.status !== "pending" && req.user.role !== "admin") {
      return res.status(400).json({ message: "Only pending schedules can be updated" })
    }

    // Update schedule fields
    if (title) schedule.title = title
    if (department) schedule.department = department
    if (period) schedule.period = period
    if (startDate) schedule.startDate = startDate
    if (endDate) schedule.endDate = endDate
    if (description) schedule.description = description

    // Update items if provided
    if (items && items.length > 0) {
      schedule.items = items
    }

    // Update status if provided and user has permission
    if (status && ["department_head", "manager", "admin"].includes(req.user.role)) {
      schedule.status = status
    }

    await schedule.save()

    // Get updated schedule with associations
    const updatedSchedule = await Schedule.findByPk(schedule.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "fullName"],
        },
      ],
    })

    res.json({
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Approve schedule
export const approveSchedule = async (req: Request, res: Response) => {
  try {
    const { status, comments } = req.body

    // Find schedule by id
    const schedule = await Schedule.findByPk(req.params.id)
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
    schedule.approverId = req.user.id

    if (status === "approved") {
      schedule.approvedAt = new Date()
    }

    await schedule.save()

    // Get updated schedule with associations
    const updatedSchedule = await Schedule.findByPk(schedule.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "fullName"],
        },
      ],
    })

    res.json({
      message: "Schedule approval status updated successfully",
      schedule: updatedSchedule,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete schedule
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id)
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    // Check if user is the creator or admin
    if (schedule.creatorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this schedule" })
    }

    // Only allow deletion of pending schedules unless user is admin
    if (schedule.status !== "pending" && req.user.role !== "admin") {
      return res.status(400).json({ message: "Only pending schedules can be deleted" })
    }

    await schedule.destroy()
    res.json({ message: "Schedule deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
