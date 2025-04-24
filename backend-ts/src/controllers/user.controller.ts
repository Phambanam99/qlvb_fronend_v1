import type { Request, Response } from "express"
import { Op } from "sequelize"
import User from "../models/User"

// Get all users
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    })
    res.json(users)
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, fullName, email, department, position, role, status } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    })

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = await User.create({
      username,
      password,
      fullName,
      email,
      department,
      position,
      role: role || "staff",
      status: status || "active",
      avatar: fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    })

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        department: user.department,
        position: user.position,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, department, position, role, status, phone } = req.body

    // Find user by id
    const user = await User.findByPk(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if user is authorized to update
    if (user.id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this user" })
    }

    // Update user fields
    if (fullName) user.fullName = fullName
    if (email) user.email = email
    if (department) user.department = department
    if (position) user.position = position
    if (role && req.user.role === "admin") user.role = role
    if (status && req.user.role === "admin") user.status = status
    if (phone) user.phone = phone

    // If password is provided, it will be hashed by the model hooks
    if (req.body.password) {
      user.password = req.body.password
    }

    await user.save()

    res.json({
      message: "User updated successfully",
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        department: user.department,
        position: user.position,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        phone: user.phone,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    await user.destroy()
    res.json({ message: "User deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
