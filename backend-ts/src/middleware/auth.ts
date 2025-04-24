import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User from "../models/User"

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

interface JwtPayload {
  userId: number
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No authentication token, access denied" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as JwtPayload

    // Find user by id
    const user = await User.findByPk(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: "User not found, access denied" })
    }

    if (user.status !== "active") {
      return res.status(401).json({ message: "User account is inactive, access denied" })
    }

    // Add user to request
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid token, access denied" })
  }
}

export default auth
