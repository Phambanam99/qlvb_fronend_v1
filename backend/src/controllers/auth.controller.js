const User = require("../models/User")
const jwt = require("jsonwebtoken")

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, password, fullName, email, department, position, role } = req.body

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
      avatar: fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    })

    await user.save()

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        department: user.department,
        position: user.position,
        role: user.role,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Find user by username
    const user = await User.findOne({ username })
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
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        department: user.department,
        position: user.position,
        role: user.role,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
