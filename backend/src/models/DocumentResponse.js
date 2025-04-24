const mongoose = require("mongoose")

const documentResponseSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IncomingDocument",
      required: true,
    },
    content: {
      type: String,
      required: true,
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
    status: {
      type: String,
      enum: ["draft", "pending_approval", "rejected", "approved"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    managerComment: {
      type: String,
      default: "",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
  },
  {
    timestamps: true,
  },
)

const DocumentResponse = mongoose.model("DocumentResponse", documentResponseSchema)

module.exports = DocumentResponse
