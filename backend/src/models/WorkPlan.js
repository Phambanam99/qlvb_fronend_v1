const mongoose = require("mongoose")

const workPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["planned", "in_progress", "completed"],
      default: "planned",
    },
    tasks: [
      {
        title: String,
        description: String,
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        startDate: Date,
        endDate: Date,
        status: {
          type: String,
          enum: ["pending", "in_progress", "completed"],
          default: "pending",
        },
      },
    ],
    attachments: [
      {
        name: String,
        path: String,
        size: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

const WorkPlan = mongoose.model("WorkPlan", workPlanSchema)

module.exports = WorkPlan
