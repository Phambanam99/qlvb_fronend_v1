import type { Request, Response } from "express"
import DocumentResponse from "../models/DocumentResponse"
import IncomingDocument from "../models/IncomingDocument"
import User from "../models/User"

// Create a new document response
export const createResponse = async (req: Request, res: Response) => {
  try {
    const { documentId, content, attachments } = req.body

    // Check if document exists
    const document = await IncomingDocument.findByPk(documentId)
    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Create new response
    const response = await DocumentResponse.create({
      documentId,
      content,
      attachments: attachments || [],
      createdById: req.user.id,
      status: "pending_approval",
    })

    // Update document processing history
    const processingHistory = [...document.processingHistory]
    processingHistory.push({
      action: "Cán bộ xử lý",
      actorId: req.user.id,
      timestamp: new Date(),
      description: "Đã hoàn thành xử lý văn bản và gửi lại Trưởng phòng xem xét.",
      status: "completed",
    })
    document.processingHistory = processingHistory

    await document.save()

    // Get response with associations
    const createdResponse = await DocumentResponse.findByPk(response.id, {
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName"],
        },
      ],
    })

    res.status(201).json({
      message: "Response created successfully",
      response: createdResponse,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get response by ID
export const getResponseById = async (req: Request, res: Response) => {
  try {
    const response = await DocumentResponse.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName"],
        },
        {
          model: User,
          as: "approvedBy",
          attributes: ["id", "fullName"],
        },
      ],
    })

    if (!response) {
      return res.status(404).json({ message: "Response not found" })
    }

    res.json(response)
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update response
export const updateResponse = async (req: Request, res: Response) => {
  try {
    const { content, attachments, status, managerComment } = req.body

    // Find response by id
    const response = await DocumentResponse.findByPk(req.params.id)
    if (!response) {
      return res.status(404).json({ message: "Response not found" })
    }

    // Check if user is the creator or has appropriate role
    if (response.createdById !== req.user.id && !["department_head", "manager", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized to update this response" })
    }

    // Update response fields
    if (content) response.content = content
    if (managerComment) response.managerComment = managerComment

    // Update status if provided and user has permission
    if (status && ["department_head", "manager", "admin"].includes(req.user.role)) {
      response.status = status
    }

    // Add new attachments if provided
    if (attachments && attachments.length > 0) {
      response.attachments = [...response.attachments, ...attachments]
    }

    // Update document processing history if status changed
    if (status) {
      const document = await IncomingDocument.findByPk(response.documentId)
      if (document) {
        let action, description

        if (status === "approved") {
          action = req.user.role === "department_head" ? "Chỉ huy phòng phê duyệt" : "Thủ trưởng xem xét"
          description =
            req.user.role === "department_head"
              ? "Đã phê duyệt và trình lên Thủ trưởng xem xét."
              : "Thủ trưởng đã xem xét và phê duyệt văn bản trả lời."

          response.approvedById = req.user.id
          response.approvedAt = new Date()

          // If approved by manager, mark document as completed
          if (req.user.role === "manager") {
            document.status = "completed"
          }
        } else if (status === "rejected") {
          action = req.user.role === "department_head" ? "Chỉ huy phòng yêu cầu chỉnh sửa" : "Thủ trưởng trả lại"
          description = "Yêu cầu bổ sung thêm thông tin và chỉnh sửa."
        }

        const processingHistory = [...document.processingHistory]
        processingHistory.push({
          action,
          actorId: req.user.id,
          timestamp: new Date(),
          description,
          status: "completed",
        })
        document.processingHistory = processingHistory

        await document.save()
      }
    }

    await response.save()

    // Get updated response with associations
    const updatedResponse = await DocumentResponse.findByPk(response.id, {
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName"],
        },
        {
          model: User,
          as: "approvedBy",
          attributes: ["id", "fullName"],
        },
      ],
    })

    res.json({
      message: "Response updated successfully",
      response: updatedResponse,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete response
export const deleteResponse = async (req: Request, res: Response) => {
  try {
    const response = await DocumentResponse.findByPk(req.params.id)
    if (!response) {
      return res.status(404).json({ message: "Response not found" })
    }

    // Check if user is the creator or has appropriate role
    if (response.createdById !== req.user.id && !["department_head", "manager", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized to delete this response" })
    }

    await response.destroy()
    res.json({ message: "Response deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
