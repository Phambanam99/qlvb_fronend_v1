import dotenv from "dotenv"
dotenv.config()

import { sequelize } from "../config/database"
import User from "../models/User"
import IncomingDocument from "../models/IncomingDocument"
import OutgoingDocument from "../models/OutgoingDocument"
import WorkPlan from "../models/WorkPlan"
import Schedule from "../models/Schedule"
import DocumentResponse from "../models/DocumentResponse"
import DocumentAssignment from "../models/DocumentAssignment"

// Sample data for users
const users = [
  {
    username: "admin",
    password: "admin123",
    fullName: "Admin User",
    email: "admin@example.com",
    department: "Administration",
    position: "System Administrator",
    role: "admin",
    status: "active",
  },
  {
    username: "manager",
    password: "manager123",
    fullName: "Manager User",
    email: "manager@example.com",
    department: "Management",
    position: "Department Manager",
    role: "manager",
    status: "active",
  },
  {
    username: "depthead",
    password: "depthead123",
    fullName: "Department Head",
    email: "depthead@example.com",
    department: "Operations",
    position: "Department Head",
    role: "department_head",
    status: "active",
  },
  {
    username: "staff1",
    password: "staff123",
    fullName: "Staff User One",
    email: "staff1@example.com",
    department: "Operations",
    position: "Staff Member",
    role: "staff",
    status: "active",
  },
  {
    username: "staff2",
    password: "staff123",
    fullName: "Staff User Two",
    email: "staff2@example.com",
    department: "Finance",
    position: "Staff Member",
    role: "staff",
    status: "active",
  },
  {
    username: "clerk",
    password: "clerk123",
    fullName: "Clerk User",
    email: "clerk@example.com",
    department: "Administration",
    position: "Document Clerk",
    role: "clerk",
    status: "active",
  },
]

// Sample data for incoming documents
const incomingDocuments = [
  {
    number: "IN-2023-001",
    title: "Request for Budget Approval",
    receivedDate: new Date("2023-01-15"),
    sender: "Finance Ministry",
    content: "Request for approval of the annual budget for the fiscal year 2023.",
    documentType: "official",
    status: "pending",
    assignedDepartment: "Finance",
    managerOpinion: "",
    deadline: new Date("2023-02-15"),
    attachments: [
      {
        name: "budget_proposal.pdf",
        path: "/uploads/budget_proposal.pdf",
        size: "2.5MB",
        uploadedAt: new Date(),
      },
    ],
    processingHistory: [
      {
        action: "Tiếp nhận văn bản",
        actorId: 6, // clerk
        timestamp: new Date(),
        description: "Văn bản đã được tiếp nhận và vào sổ văn bản đến.",
        status: "completed",
      },
    ],
    createdById: 6, // clerk
  },
  {
    number: "IN-2023-002",
    title: "New Regulations on Document Management",
    receivedDate: new Date("2023-02-10"),
    sender: "Government Office",
    content: "New regulations regarding the management and processing of official documents.",
    documentType: "directive",
    status: "processing",
    assignedDepartment: "Operations",
    managerOpinion: "Please review and implement these new regulations.",
    deadline: new Date("2023-03-10"),
    attachments: [
      {
        name: "regulations.pdf",
        path: "/uploads/regulations.pdf",
        size: "1.8MB",
        uploadedAt: new Date(),
      },
    ],
    processingHistory: [
      {
        action: "Tiếp nhận văn bản",
        actorId: 6, // clerk
        timestamp: new Date("2023-02-10"),
        description: "Văn bản đã được tiếp nhận và vào sổ văn bản đến.",
        status: "completed",
      },
      {
        action: "Phân công xử lý",
        actorId: 2, // manager
        timestamp: new Date("2023-02-12"),
        description: "Văn bản đã được phân công cho phòng Operations xử lý.",
        status: "completed",
      },
    ],
    createdById: 6, // clerk
  },
  {
    number: "IN-2023-003",
    title: "Annual Performance Review Request",
    receivedDate: new Date("2023-03-05"),
    sender: "Human Resources Department",
    content: "Request for annual performance reviews of all staff members.",
    documentType: "official",
    status: "completed",
    assignedDepartment: "Operations",
    managerOpinion: "Complete all performance reviews by the end of the month.",
    deadline: new Date("2023-03-31"),
    attachments: [
      {
        name: "performance_template.docx",
        path: "/uploads/performance_template.docx",
        size: "500KB",
        uploadedAt: new Date(),
      },
    ],
    processingHistory: [
      {
        action: "Tiếp nhận văn bản",
        actorId: 6, // clerk
        timestamp: new Date("2023-03-05"),
        description: "Văn bản đã được tiếp nhận và vào sổ văn bản đến.",
        status: "completed",
      },
      {
        action: "Phân công xử lý",
        actorId: 2, // manager
        timestamp: new Date("2023-03-06"),
        description: "Văn bản đã được phân công cho phòng Operations xử lý.",
        status: "completed",
      },
      {
        action: "Cán bộ xử lý",
        actorId: 4, // staff1
        timestamp: new Date("2023-03-20"),
        description: "Đã hoàn thành xử lý văn bản và gửi lại Trưởng phòng xem xét.",
        status: "completed",
      },
      {
        action: "Chỉ huy phòng phê duyệt",
        actorId: 3, // depthead
        timestamp: new Date("2023-03-22"),
        description: "Đã phê duyệt và trình lên Thủ trưởng xem xét.",
        status: "completed",
      },
      {
        action: "Thủ trưởng xem xét",
        actorId: 2, // manager
        timestamp: new Date("2023-03-25"),
        description: "Thủ trưởng đã xem xét và phê duyệt văn bản trả lời.",
        status: "completed",
      },
    ],
    createdById: 6, // clerk
  },
]

// Sample data for document assignments
const documentAssignments = [
  {
    documentId: 2, // IN-2023-002
    userId: 4, // staff1
    assignedById: 3, // depthead
    assignedAt: new Date("2023-02-12"),
    status: "in_progress",
  },
  {
    documentId: 3, // IN-2023-003
    userId: 4, // staff1
    assignedById: 3, // depthead
    assignedAt: new Date("2023-03-06"),
    status: "completed",
  },
]

// Sample data for document responses
const documentResponses = [
  {
    documentId: 3, // IN-2023-003
    content: "All performance reviews have been completed as requested. Please find attached the summary report.",
    attachments: [
      {
        name: "performance_summary.pdf",
        path: "/uploads/performance_summary.pdf",
        size: "1.2MB",
        uploadedAt: new Date("2023-03-20"),
      },
    ],
    status: "approved",
    createdById: 4, // staff1
    managerComment: "Good work. Approved.",
    approvedById: 2, // manager
    approvedAt: new Date("2023-03-25"),
  },
]

// Sample data for outgoing documents
const outgoingDocuments = [
  {
    number: "OUT-2023-001",
    title: "Response to Budget Approval Request",
    sentDate: new Date("2023-02-20"),
    recipient: "Finance Ministry",
    content: "We are pleased to inform you that the proposed budget for fiscal year 2023 has been approved.",
    documentType: "official",
    status: "sent",
    creatorId: 5, // staff2
    approverId: 2, // manager
    priority: "normal",
    note: "",
    attachments: [
      {
        name: "approved_budget.pdf",
        path: "/uploads/approved_budget.pdf",
        size: "3MB",
        uploadedAt: new Date(),
      },
    ],
    history: [
      {
        action: "Tạo văn bản",
        actorId: 5, // staff2
        timestamp: new Date("2023-02-15"),
        description: "Văn bản được tạo và lưu dưới dạng bản nháp.",
      },
      {
        action: "Gửi phê duyệt",
        actorId: 5, // staff2
        timestamp: new Date("2023-02-17"),
        description: "Văn bản được gửi đến Trưởng phòng để xem xét.",
      },
      {
        action: "Trưởng phòng phê duyệt",
        actorId: 3, // depthead
        timestamp: new Date("2023-02-18"),
        description: "Văn bản đã được phê duyệt và trình lên Thủ trưởng.",
      },
      {
        action: "Thủ trưởng phê duyệt",
        actorId: 2, // manager
        timestamp: new Date("2023-02-19"),
        description: "Văn bản đã được phê duyệt.",
      },
    ],
  },
  {
    number: "OUT-2023-002",
    title: "Monthly Operations Report",
    sentDate: new Date("2023-03-10"),
    recipient: "Board of Directors",
    content: "Monthly report on operations activities and achievements for February 2023.",
    documentType: "report",
    status: "approved",
    creatorId: 4, // staff1
    approverId: 2, // manager
    priority: "normal",
    note: "",
    attachments: [
      {
        name: "operations_report_feb.pdf",
        path: "/uploads/operations_report_feb.pdf",
        size: "2.1MB",
        uploadedAt: new Date(),
      },
    ],
    history: [
      {
        action: "Tạo văn bản",
        actorId: 4, // staff1
        timestamp: new Date("2023-03-05"),
        description: "Văn bản được tạo và lưu dưới dạng bản nháp.",
      },
      {
        action: "Gửi phê duyệt",
        actorId: 4, // staff1
        timestamp: new Date("2023-03-07"),
        description: "Văn bản được gửi đến Trưởng phòng để xem xét.",
      },
      {
        action: "Trưởng phòng phê duyệt",
        actorId: 3, // depthead
        timestamp: new Date("2023-03-08"),
        description: "Văn bản đã được phê duyệt và trình lên Thủ trưởng.",
      },
      {
        action: "Thủ trưởng phê duyệt",
        actorId: 2, // manager
        timestamp: new Date("2023-03-09"),
        description: "Văn bản đã được phê duyệt.",
      },
    ],
  },
]

// Sample data for work plans
const workPlans = [
  {
    title: "Q1 2023 Operations Plan",
    department: "Operations",
    startDate: new Date("2023-01-01"),
    endDate: new Date("2023-03-31"),
    description: "Quarterly work plan for the Operations department for Q1 2023.",
    status: "in_progress",
    tasks: [
      {
        title: "Update document management procedures",
        description: "Review and update all document management procedures based on new regulations.",
        assignedToId: 4, // staff1
        startDate: new Date("2023-01-15"),
        endDate: new Date("2023-02-15"),
        status: "completed",
      },
      {
        title: "Staff training on new procedures",
        description: "Conduct training sessions for all staff on the updated document management procedures.",
        assignedToId: 3, // depthead
        startDate: new Date("2023-02-20"),
        endDate: new Date("2023-03-10"),
        status: "in_progress",
      },
    ],
    attachments: [
      {
        name: "q1_plan.pdf",
        path: "/uploads/q1_plan.pdf",
        size: "1.5MB",
        uploadedAt: new Date(),
      },
    ],
    createdById: 3, // depthead
  },
]

// Sample data for schedules
const schedules = [
  {
    title: "March 2023 Department Meetings",
    department: "Operations",
    period: "month",
    startDate: new Date("2023-03-01"),
    endDate: new Date("2023-03-31"),
    description: "Schedule of all department meetings for March 2023.",
    status: "approved",
    items: [
      {
        title: "Weekly Team Meeting",
        date: new Date("2023-03-06"),
        startTime: "09:00",
        endTime: "10:30",
        location: "Conference Room A",
        type: "internal",
        participants: ["All Operations Staff"],
        description: "Regular weekly team meeting to discuss ongoing projects and issues.",
      },
      {
        title: "Document Management Training",
        date: new Date("2023-03-15"),
        startTime: "13:00",
        endTime: "16:00",
        location: "Training Room",
        type: "internal",
        participants: ["All Staff"],
        description: "Training session on the new document management procedures.",
      },
      {
        title: "Meeting with Finance Ministry",
        date: new Date("2023-03-22"),
        startTime: "10:00",
        endTime: "12:00",
        location: "Finance Ministry Office",
        type: "external",
        participants: ["Department Head", "Manager"],
        description: "Discussion on budget implementation for Q2 2023.",
      },
    ],
    creatorId: 3, // depthead
    approverId: 2, // manager
    approvedAt: new Date("2023-02-25"),
    comments: "Approved. Please ensure all staff are notified of the schedule.",
  },
]

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Sync database models
    await sequelize.sync({ force: true })
    console.log("Database synchronized")

    // Create users
    const createdUsers = await User.bulkCreate(users)
    console.log(`Created ${createdUsers.length} users`)

    // Create incoming documents
    const createdIncomingDocs = await IncomingDocument.bulkCreate(incomingDocuments)
    console.log(`Created ${createdIncomingDocs.length} incoming documents`)

    // Create document assignments
    const createdAssignments = await DocumentAssignment.bulkCreate(documentAssignments)
    console.log(`Created ${createdAssignments.length} document assignments`)

    // Create document responses
    const createdResponses = await DocumentResponse.bulkCreate(documentResponses)
    console.log(`Created ${createdResponses.length} document responses`)

    // Create outgoing documents
    const createdOutgoingDocs = await OutgoingDocument.bulkCreate(outgoingDocuments)
    console.log(`Created ${createdOutgoingDocs.length} outgoing documents`)

    // Create work plans
    const createdWorkPlans = await WorkPlan.bulkCreate(workPlans)
    console.log(`Created ${createdWorkPlans.length} work plans`)

    // Create schedules
    const createdSchedules = await Schedule.bulkCreate(schedules)
    console.log(`Created ${createdSchedules.length} schedules`)

    console.log("Database seeded successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    // Close database connection
    await sequelize.close()
  }
}

// Run the seed function
seedDatabase()
