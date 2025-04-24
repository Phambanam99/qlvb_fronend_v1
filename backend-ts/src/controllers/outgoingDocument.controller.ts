import type { Request, Response } from "express"
import OutgoingDocument from "../models/OutgoingDocument"
import User from "../models/User"

// Get all outgoing documents
export const getAllDocuments = async (_req: Request, res: Response) => {
  try {
    const documents = await OutgoingDocument.findAll({
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "fullName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    res.json(documents)
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get document by ID
export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const document = await OutgoingDocument.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName", "position", "department"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "fullName", "position"],
        },
      ],
    })

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    res.json(document)
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create a new document
export const createDocument = async (req: Request, res: Response) => {
  try {
    const { number, title, sentDate, recipient, content, documentType, approverId, priority, note, attachments } =
      req.body

    // Check if document with same number already exists
    const existingDocument = await OutgoingDocument.findOne({
      where: { number },
    })

    if (existingDocument) {
      return res.status(400).json({ message: "Document with this number already exists" })
    }

    // Create new document
    const document = await OutgoingDocument.create({
      number,
      title,
      sentDate,
      recipient,
      content,
      documentType,
      approverId,
      priority,
      note,
      attachments: attachments || [],
      creatorId: req.user.id,
      status: "draft",
      history: [
        {
          action: "Tạo văn bản",
          actorId: req.user.id,
          timestamp: new Date(),
          description: "Văn bản được tạo và lưu dưới dạng bản nháp.",
        },
      ],
    })

    // Get document with associations
    const createdDocument = await OutgoingDocument.findByPk(document.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName"],
        },
      ],
    })

    res.status(201).json({
      message: "Document created successfully",
      document: createdDocument,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update document
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { title, sentDate, recipient, content, documentType, status, approverId, priority, note, attachments } =
      req.body

    // Find document by id
    const document = await OutgoingDocument.findByPk(req.params.id)
    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check if user is the creator or has appropriate role
    if (document.creatorId !== req.user.id && !["department_head", "manager", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized to update this document" })
    }

    // Update document fields
    if (title) document.title = title
    if (sentDate) document.sentDate = sentDate
    if (recipient) document.recipient = recipient
    if (content) document.content = content
    if (documentType) document.documentType = documentType
    if (approverId) document.approverId = approverId
    if (priority) document.priority = priority
    if (note) document.note = note

    // Update status if provided and valid
    if (status) {
      // Only allow certain status transitions
      if (status === "pending_approval" && document.status === "draft") {
        document.status = status

        // Add to history
        const history = [...document.history]
        history.push({
          action: "Gửi phê duyệt",
          actorId: req.user.id,
          timestamp: new Date(),
          description: "Văn bản được gửi đến Trưởng phòng để xem xét.",
        })
        document.history = history
      } else if (["department_head", "manager", "admin"].includes(req.user.role)) {
        document.status = status
      }
    }

    // Add new attachments if provided
    if (attachments && attachments.length > 0) {
      document.attachments = [...document.attachments, ...attachments]
    }

    // Add to history if not already added for update
    let historyUpdated = false
    for (const item of document.history) {
      if (item.action === "Cập nhật văn bản") {
        historyUpdated = true
        break
      }
    }

    if (!historyUpdated) {
      const history = [...document.history]
      history.push({
        action: "Cập nhật văn bản",
        actorId: req.user.id,
        timestamp: new Date(),
        description: "Văn bản được cập nhật thông tin.",
      })
      document.history = history
    }

    await document.save()

    // Get updated document with associations
    const updatedDocument = await OutgoingDocument.findByPk(document.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "fullName"],
        },
      ],
    })

    res.json({
      message: "Document updated successfully",
      document: updatedDocument,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Approve document
export const approveDocument = async (req: Request, res: Response) => {
  try {
    const { status, comments } = req.body

    // Find document by id
    const document = await OutgoingDocument.findByPk(req.params.id)
    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check if document is in pending_approval status
    if (document.status !== "pending_approval") {
      return res.status(400).json({ message: "Document is not in pending approval status" })
    }

    // Update document status
    if (status === "approved") {
      document.status = "approved"
      document.approverId = req.user.id

      // Add to history
      const history = [...document.history]
      history.push({
        action: req.user.role === "department_head" ? "Trưởng phòng phê duyệt" : "Thủ trưởng phê duyệt",
        actorId: req.user.id,
        timestamp: new Date(),
        description: comments || "Văn bản đã được phê duyệt.",
      })
      document.history = history
    } else if (status === "rejected") {
      document.status = "draft"

      // Add to history
      const history = [...document.history]
      history.push({
        action: req.user.role === "department_head" ? "Trưởng phòng từ chối" : "Thủ trưởng từ chối",
        actorId: req.user.id,
        timestamp: new Date(),
        description: comments || "Văn bản bị từ chối và trả lại người soạn thảo để chỉnh sửa.",
      })
      document.history = history
    }

    await document.save()

    // Get updated document with associations
    const updatedDocument = await OutgoingDocument.findByPk(document.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "fullName"],
        },
      ],
    })

    res.json({
      message: "Document approval status updated successfully",
      document: updatedDocument,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete document
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const document = await OutgoingDocument.findByPk(req.params.id)
    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check if user is the creator or admin
    if (document.creatorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this document" })
    }

    // Only allow deletion of draft documents
    if (document.status !== "draft" && req.user.role !== "admin") {
      return res.status(400).json({ message: "Only draft documents can be deleted" })
    }

    await document.destroy()
    res.json({ message: "Document deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
