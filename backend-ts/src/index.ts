import dotenv from "dotenv"
dotenv.config()

import express, { type Request, type Response } from "express"
import cors from "cors"
import { sequelize } from "./config/database"
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import incomingDocumentRoutes from "./routes/incomingDocument.routes"
import outgoingDocumentRoutes from "./routes/outgoingDocument.routes"
import workPlanRoutes from "./routes/workPlan.routes"
import scheduleRoutes from "./routes/schedule.routes"
import documentResponseRoutes from "./routes/documentResponse.routes"

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/incoming-documents", incomingDocumentRoutes)
app.use("/api/outgoing-documents", outgoingDocumentRoutes)
app.use("/api/work-plans", workPlanRoutes)
app.use("/api/schedules", scheduleRoutes)
app.use("/api/document-responses", documentResponseRoutes)

// Default route
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Document Management System API" })
})

// Connect to PostgreSQL and start server
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log("Connected to PostgreSQL database")

    // Sync all models with database
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" })
    console.log("Database synchronized")

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Failed to connect to database:", error)
    process.exit(1)
  }
}

startServer()
