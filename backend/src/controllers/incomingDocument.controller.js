const IncomingDocument = require("../models/IncomingDocument")
const DocumentResponse = require("../models/DocumentResponse")

// Get all incoming documents
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await IncomingDocument.find()
      .populate("createdBy", "fullName")
      .populate("assignedTo.users", "fullName")
      .sort({ createdAt: -1 })
    res.json(documents)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await IncomingDocument.findById(req.params.id)
      .populate("createdBy", "fullName")
      .populate("assignedTo.users", "fullName")
      .populate("processingHistory.actor", "fullName position")

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Get responses for this document
    const responses = await DocumentResponse.find({ documentId: document._id })
      .populate("createdBy", "fullName")
      .populate("approvedBy", "fullName")
      .sort({ createdAt: -1 })

    res.json({ document, responses })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create a new document
exports.createDocument = async (req, res) => {
  try {
    const {
      number,
      title,
      receivedDate,
      sender,
      content,
      documentType,
      assignedTo,
      managerOpinion,
      deadline,
      attachments,
    } = req.body

    // Check if document with same number already exists
    const existingDocument = await IncomingDocument.findOne({ number })
    if (existingDocument) {
      return res.status(400).json({ message: "Document with this number already exists" })
    }

    // Create new document
    const document = new IncomingDocument({
      number,
      title,
      receivedDate,
      sender,
      content,
      documentType,
      assignedTo,
      managerOpinion,
      deadline,
      attachments,
      createdBy: req.user._id,
      processingHistory: [
        {
          action: "Tiếp nhận văn bản",
          actor: req.user._id,
          description: "Văn bản đã được tiếp nhận và vào sổ văn bản đến.",
          status: "completed",
        },
      ],
    })

    await document.save()

    res.status(201).json({
      message: "Document created successfully",
      document,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const {
      title,
      receivedDate,
      sender,
      content,
      documentType,
      status,
      assignedTo,
      managerOpinion,
      deadline,
      attachments,
    } = req.body

    // Find document by id
    const document = await IncomingDocument.findById(req.params.id)
    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Update document fields
    document.title = title || document.title
    document.receivedDate = receivedDate || document.receivedDate
    document.sender = sender || document.sender
    document.content = content || document.content
    document.documentType = documentType || document.documentType
    document.status = status || document.status
    document.assignedTo = assignedTo || document.assignedTo
    document.managerOpinion = managerOpinion || document.managerOpinion
    document.deadline = deadline || document.deadline

    // Add new attachments if provided
    if (attachments && attachments.length > 0) {
      document.attachments = [...document.attachments, ...attachments]
    }

    // Add to processing history
    document.processingHistory.push({
      action: "Cập nhật văn bản",
      actor: req.user._id,
      description: "Văn bản đã được cập nhật thông tin.",
      status: "completed",
    })

    document.updatedAt = Date.now()

    await document.save()

    res.json({
      message: "Document updated successfully",
      document,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Assign document to users
exports.assignDocument = async (req, res) => {
  try {
    const { department, users, deadline, comments } = req.body

    // Find document by id
    const document = await IncomingDocument.findById(req.params.id)
    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Update assignment
    document.assignedTo = {
      department,
      users,
    }
    document.deadline = deadline
    document.status = "processing"

    // Add to processing history
    document.processingHistory.push({
      action: "Phân công xử lý",
      actor: req.user._id,
      description: comments || "Văn bản đã được phân công cho cán bộ xử lý.",
      status: "completed",
    })

    document.updatedAt = Date.now()

    await document.save()

    res.json({
      message: "Document assigned successfully",
      document,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await IncomingDocument.findById(req.params.id)
    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    await IncomingDocument.findByIdAndDelete(req.params.id)

    // Also delete all responses for this document
    await DocumentResponse.deleteMany({ documentId: req.params.id })

    res.json({ message: "Document deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
