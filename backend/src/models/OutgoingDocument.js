const mongoose = require("mongoose")

const outgoingDocumentSchema = new mongoose.Schema(
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
    sentDate: {
      type: Date,
      required: true,
    },
    recipient: {
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
      enum: ["draft", "pending_approval", "approved", "sent"],
      default: "draft",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    priority: {
      type: String,
      enum: ["normal", "high", "urgent"],
      default: "normal",
    },
    note: {
      type: String,
      default: "",
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
    history: [
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
      },
    ],
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

const OutgoingDocument = mongoose.model("OutgoingDocument", outgoingDocumentSchema)

module.exports = OutgoingDocument
