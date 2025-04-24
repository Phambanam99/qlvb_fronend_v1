import type { Request, Response } from "express"
import IncomingDocument from "../models/IncomingDocument"
import DocumentResponse from "../models/DocumentResponse"
import DocumentAssignment from "../models/DocumentAssignment"
import User from "../models/User"

// Get all incoming documents
export const getAllDocuments = async (_req: Request, res: Response) => {
  try {
    const documents = await IncomingDocument.findAll({
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName"],
        },
        {
          model: DocumentAssignment,
          as: "assignments",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "fullName"],
            },
          ],
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
    const document = await IncomingDocument.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "fullName"],
        },
        {
          model: DocumentAssignment,
          as: "assignments",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "fullName", "position"],
            },
            {
              model: User,
              as: "assignedBy",
              attributes: ["id", "fullName", "position"],
            },
          ],
        },
      ],
    })

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Get responses for this document
    const responses = await DocumentResponse.findAll({
      where: { documentId: document.id },
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
      order: [["createdAt", "DESC"]],
    })

    res.json({ document, responses })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create a new document
export const createDocument = async (req: Request, res: Response) => {
  try {
    const {
      number,
      title,
      receivedDate,
      sender,
      content,
      documentType,
      assignedDepartment,
      managerOpinion,
      deadline,
      attachments,
    } = req.body

    // Check if document with same number already exists
    const existingDocument = await IncomingDocument.findOne({
      where: { number },
    })

    if (existingDocument) {
      return res.status(400).json({ message: "Document with this number already exists" })
    }

    // Create new document
    const document = await IncomingDocument.create({
      number,
      title,
      receivedDate,
      sender,
      content,
      documentType,
      assignedDepartment,
      managerOpinion,
      deadline,
      attachments: attachments || [],
      processingHistory: [
        {
          action: "Tiếp nhận văn bản",
          actorId: req.user.id,
          timestamp: new Date(),
          description: "Văn bản đã được tiếp nhận và vào sổ văn bản đến.",
          status: "completed",
        },
      ],
      createdById: req.user.id,
    })

    res.status(201).json({
      message: "Document created successfully",
      document,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update document
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const {
      title,
      receivedDate,
      sender,
      content,
      documentType,
      status,
      assignedDepartment,
      managerOpinion,
      deadline,
      attachments,
    } = req.body

    // Find document by id
    const document = await IncomingDocument.findByPk(req.params.id)
    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Update document fields
    if (title) document.title = title
    if (receivedDate) document.receivedDate = receivedDate
    if (sender) document.sender = sender
    if (content) document.content = content
    if (documentType) document.documentType = documentType
    if (status) document.status = status
    if (assignedDepartment) document.assignedDepartment = assignedDepartment
    if (managerOpinion) document.managerOpinion = managerOpinion
    if (deadline) document.deadline = deadline

    // Add new attachments if provided
    if (attachments && attachments.length > 0) {
      document.attachments = [...document.attachments, ...attachments]
    }

    // Add to processing history
    const processingHistory = [...document.processingHistory]
    processingHistory.push({
      action: "Cập nhật văn bản",
      actorId: req.user.id,
      timestamp: new Date(),
      description: "Văn bản đã được cập nhật thông tin.",
      status: "completed",
    })
    document.processingHistory = processingHistory

    await document.save()

    res.json({
      message: "Document updated successfully",
      document,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Assign document to users
export const assignDocument = async (req: Request, res: Response) => {
  try {
    const { department, userIds, deadline, comments } = req.body

    // Find document by id
    const document = await IncomingDocument.findByPk(req.params.id)
    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Update document
    document.assignedDepartment = department
    document.deadline = deadline
    document.status = "processing"

    // Add to processing history
    const processingHistory = [...document.processingHistory]
    processingHistory.push({
      action: "Phân công xử lý",
      actorId: req.user.id,
      timestamp: new Date(),
      description: comments || "Văn bản đã được phân công cho cán bộ xử lý.",
      status: "completed",
    })
    document.processingHistory = processingHistory

    await document.save()

    // Create assignments for each user
    if (userIds && userIds.length > 0) {
      // Delete existing assignments
      await DocumentAssignment.destroy({
        where: { documentId: document.id },
      })

      // Create new assignments
      const assignments = userIds.map((userId) => ({
        documentId: document.id,
        userId,
        assignedById: req.user.id,
        assignedAt: new Date(),
        status: "pending",
      }))

      await DocumentAssignment.bulkCreate(assignments)
    }

    // Get updated document with assignments
    const updatedDocument = await IncomingDocument.findByPk(document.id, {
      include: [
        {
          model: DocumentAssignment,
          as: "assignments",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "fullName"],
            },
          ],
        },
      ],
    })

    res.json({
      message: "Document assigned successfully",
      document: updatedDocument,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete document
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const document = await IncomingDocument.findByPk(req.params.id)
    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Delete document (this will cascade delete assignments)
    await document.destroy()

    // Also delete all responses for this document
    await DocumentResponse.destroy({
      where: { documentId: req.params.id },
    })

    res.json({ message: "Document deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
