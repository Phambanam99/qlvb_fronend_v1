const mongoose = require("mongoose")

const incomingDocumentSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    receivedDate: {
      type: Date,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    documentType: {
      type: String,
      enum: ["official", "decision", "directive", "report", "plan", "other"],
      default: "official",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed"],
      default: "pending",
    },
    assignedTo: {
      department: {
        type: String,
        default: "",
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    managerOpinion: {
      type: String,
      default: "",
    },
    deadline: {
      type: Date,
    },
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
    processingHistory: [
      {
        action: String,
        actor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        description: String,
        status: {
          type: String,
          enum: ["completed", "current", "pending"],
          default: "completed",
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

const IncomingDocument = mongoose.model("IncomingDocument", incomingDocumentSchema)

module.exports = IncomingDocument
