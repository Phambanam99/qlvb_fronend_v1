import type { Request, Response, NextFunction } from "express"

type UserRole = "admin" | "manager" | "department_head" | "staff" | "clerk"

const checkRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const userRole = req.user.role

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied. You do not have the required role." })
    }

    next()
  }
}

export default checkRole
