const DocumentResponse = require("../models/DocumentResponse")
const IncomingDocument = require("../models/IncomingDocument")

// Create a new document response
exports.createResponse = async (req, res) => {
  try {
    const { documentId, content, attachments } = req.body

    // Check if document exists
    const document = await IncomingDocument.findById(documentId)
    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Create new response
    const response = new DocumentResponse({
      documentId,
      content,
      attachments,
      createdBy: req.user._id,
      status: "pending_approval",
    })

    await response.save()

    // Update document processing history
    document.processingHistory.push({
      action: "Cán bộ xử lý",
      actor: req.user._id,
      description: "Đã hoàn thành xử lý văn bản và gửi lại Trưởng phòng xem xét.",
      status: "completed",
    })

    await document.save()

    res.status(201).json({
      message: "Response created successfully",
      response,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get response by ID
exports.getResponseById = async (req, res) => {
  try {
    const response = await DocumentResponse.findById(req.params.id)
      .populate("createdBy", "fullName")
      .populate("approvedBy", "fullName")

    if (!response) {
      return res.status(404).json({ message: "Response not found" })
    }

    res.json(response)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update response
exports.updateResponse = async (req, res) => {
  try {
    const { content, attachments, status } = req.body

    // Find response by id
    const response = await DocumentResponse.findById(req.params.id)
    if (!response) {
      return res.status(404).json({ message: "Response not found" })
    }

    // Check if user is the creator or has appropriate role
    if (
      response.createdBy.toString() !== req.user._id.toString() &&
      !["department_head", "manager", "admin"].includes(req.user.role)
    ) {
      return res.status(403).json({ message: "Not authorized to update this response" })
    }

    // Update response fields
    response.content = content || response.content
    response.status = status || response.status

    // Add new attachments if provided
    if (attachments && attachments.length > 0) {
      response.attachments = [...response.attachments, ...attachments]
    }

    response.updatedAt = Date.now()

    await response.save()

    // Update document processing history if status changed
    if (status) {
      const document = await IncomingDocument.findById(response.documentId)
      if (document) {
        let action, description

        if (status === "approved") {
          action = req.user.role === "department_head" ? "Chỉ huy phòng phê duyệt" : "Thủ trưởng xem xét"
          description =
            req.user.role === "department_head"
              ? "Đã phê duyệt và trình lên Thủ trưởng xem xét."
              : "Thủ trưởng đã xem xét và phê duyệt văn bản trả lời."

          response.approvedBy = req.user._id
          response.approvedAt = Date.now()
          await response.save()

          // If approved by manager, mark document as completed
          if (req.user.role === "manager") {
            document.status = "completed"
          }
        } else if (status === "rejected") {
          action = req.user.role === "department_head" ? "Chỉ huy phòng yêu cầu chỉnh sửa" : "Thủ trưởng trả lại"
          description = "Yêu cầu bổ sung thêm thông tin và chỉnh sửa."
        }

        document.processingHistory.push({
          action,
          actor: req.user._id,
          description,
          status: "completed",
        })

        await document.save()
      }
    }

    res.json({
      message: "Response updated successfully",
      response,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete response
exports.deleteResponse = async (req, res) => {
  try {
    const response = await DocumentResponse.findById(req.params.id)
    if (!response) {
      return res.status(404).json({ message: "Response not found" })
    }

    // Check if user is the creator or has appropriate role
    if (
      response.createdBy.toString() !== req.user._id.toString() &&
      !["department_head", "manager", "admin"].includes(req.user.role)
    ) {
      return res.status(403).json({ message: "Not authorized to delete this response" })
    }

    await DocumentResponse.findByIdAndDelete(req.params.id)
    res.json({ message: "Response deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
