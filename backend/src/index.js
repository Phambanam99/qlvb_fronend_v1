require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const incomingDocumentRoutes = require("./routes/incomingDocument.routes")
const outgoingDocumentRoutes = require("./routes/outgoingDocument.routes")
const workPlanRoutes = require("./routes/workPlan.routes")
const scheduleRoutes = require("./routes/schedule.routes")

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

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Document Management System API" })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/document-management")
  .then(() => {
    console.log("Connected to MongoDB")
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err)
    process.exit(1)
  })
