const OutgoingDocument = require("../models/OutgoingDocument")

// Get all outgoing documents
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await OutgoingDocument.find()
      .populate("creator", "fullName")
      .populate("approver", "fullName")
      .sort({ createdAt: -1 })
    res.json(documents)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await OutgoingDocument.findById(req.params.id)
      .populate("creator", "fullName position department")
      .populate("approver", "fullName position")
      .populate("history.actor", "fullName position")

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    res.json(document)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create a new document
exports.createDocument = async (req, res) => {
  try {
    const { number, title, sentDate, recipient, content, documentType, approver, priority, note, attachments } =
      req.body

    // Check if document with same number already exists
    const existingDocument = await OutgoingDocument.findOne({ number })
    if (existingDocument) {
      return res.status(400).json({ message: "Document with this number already exists" })
    }

    // Create new document
    const document = new OutgoingDocument({
      number,
      title,
      sentDate,
      recipient,
      content,
      documentType,
      approver,
      priority,
      note,
      attachments,
      creator: req.user._id,
      status: "draft",
      history: [
        {
          action: "Tạo văn bản",
          actor: req.user._id,
          description: "Văn bản được tạo và lưu dưới dạng bản nháp.",
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
    const { title, sentDate, recipient, content, documentType, status, approver, priority, note, attachments } =
      req.body

    // Find document by id
    const document = await OutgoingDocument.findById(req.params.id)
    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check if user is the creator or has appropriate role
    if (
      document.creator.toString() !== req.user._id.toString() &&
      !["department_head", "manager", "admin"].includes(req.user.role)
    ) {
      return res.status(403).json({ message: "Not authorized to update this document" })
    }

    // Update document fields
    document.title = title || document.title
    document.sentDate = sentDate || document.sentDate
    document.recipient = recipient || document.recipient
    document.content = content || document.content
    document.documentType = documentType || document.documentType
    document.approver = approver || document.approver
    document.priority = priority || document.priority
    document.note = note || document.note

    // Update status if provided and valid
    if (status) {
      // Only allow certain status transitions
      if (status === "pending_approval" && document.status === "draft") {
        document.status = status
        document.history.push({
          action: "Gửi phê duyệt",
          actor: req.user._id,
          description: "Văn bản được gửi đến Trưởng phòng để xem xét.",
        })
      } else if (["department_head", "manager", "admin"].includes(req.user.role)) {
        document.status = status
      }
    }

    // Add new attachments if provided
    if (attachments && attachments.length > 0) {
      document.attachments = [...document.attachments, ...attachments]
    }

    // Add to history if not already added
    if (!document.history.some((h) => h.action === "Cập nhật văn bản")) {
      document.history.push({
        action: "Cập nhật văn bản",
        actor: req.user._id,
        description: "Văn bản được cập nhật thông tin.",
      })
    }

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

// Approve document
exports.approveDocument = async (req, res) => {
  try {
    const { status, comments } = req.body

    // Find document by id
    const document = await OutgoingDocument.findById(req.params.id)
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
      document.approver = req.user._id

      document.history.push({
        action: req.user.role === "department_head" ? "Trưởng phòng phê duyệt" : "Thủ trưởng phê duyệt",
        actor: req.user._id,
        description: comments || "Văn bản đã được phê duyệt.",
      })
    } else if (status === "rejected") {
      document.status = "draft"

      document.history.push({
        action: req.user.role === "department_head" ? "Trưởng phòng từ chối" : "Thủ trưởng từ chối",
        actor: req.user._id,
        description: comments || "Văn bản bị từ chối và trả lại người soạn thảo để chỉnh sửa.",
      })
    }

    document.updatedAt = Date.now()

    await document.save()

    res.json({
      message: "Document approval status updated successfully",
      document,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await OutgoingDocument.findById(req.params.id)
    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check if user is the creator or admin
    if (document.creator.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this document" })
    }

    // Only allow deletion of draft documents
    if (document.status !== "draft" && req.user.role !== "admin") {
      return res.status(400).json({ message: "Only draft documents can be deleted" })
    }

    await OutgoingDocument.findByIdAndDelete(req.params.id)
    res.json({ message: "Document deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
