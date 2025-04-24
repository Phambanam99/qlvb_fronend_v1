const User = require("../models/User")
const bcrypt = require("bcryptjs")

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { username, password, fullName, email, department, position, role, status } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = new User({
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

    await user.save()

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
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
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, department, position, role, status, phone } = req.body

    // Find user by id
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update user fields
    user.fullName = fullName || user.fullName
    user.email = email || user.email
    user.department = department || user.department
    user.position = position || user.position
    user.role = role || user.role
    user.status = status || user.status
    user.phone = phone || user.phone
    user.updatedAt = Date.now()

    // If password is provided, hash it
    if (req.body.password) {
      user.password = req.body.password
    }

    await user.save()

    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
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
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    await User.findByIdAndDelete(req.params.id)
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
