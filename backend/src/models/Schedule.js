const mongoose = require("mongoose")

const scheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      enum: ["day", "week", "month"],
      default: "week",
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
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    items: [
      {
        title: String,
        date: Date,
        startTime: String,
        endTime: String,
        location: String,
        type: {
          type: String,
          enum: ["internal", "external", "online", "field"],
          default: "internal",
        },
        participants: [String],
        description: String,
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    comments: String,
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

const Schedule = mongoose.model("Schedule", scheduleSchema)

module.exports = Schedule
