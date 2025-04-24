import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import User from "../models/User"
import { sequelize } from "../config/database" // Import sequelize

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, fullName, email, department, position, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [sequelize.Op.or]: [{ username }, { email }],
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
      avatar: fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    })

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1d" })

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        department: user.department,
        position: user.position,
        role: user.role,
        avatar: user.avatar,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    // Find user by username
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(401).json({ message: "Account is inactive" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1d" })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        department: user.department,
        position: user.position,
        role: user.role,
        avatar: user.avatar,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id, {
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
