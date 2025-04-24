import { Model, DataTypes, type Optional } from "sequelize"
import { sequelize } from "../config/database"
import User from "./User"

// Attachment interface
interface Attachment {
  name: string
  path: string
  size: string
  uploadedAt: Date
}

// Processing history item interface
interface ProcessingHistoryItem {
  action: string
  actorId: number
  timestamp: Date
  description: string
  status: "completed" | "current" | "pending"
}

// IncomingDocument attributes interface
interface IncomingDocumentAttributes {
  id: number
  number: string
  title: string
  receivedDate: Date
  sender: string
  content: string
  documentType: "official" | "decision" | "directive" | "report" | "plan" | "other"
  status: "pending" | "processing" | "completed"
  assignedDepartment: string
  managerOpinion: string
  deadline: Date | null
  attachments: Attachment[]
  processingHistory: ProcessingHistoryItem[]
  createdById: number
  createdAt?: Date
  updatedAt?: Date
}

// Interface for IncomingDocument creation attributes
interface IncomingDocumentCreationAttributes
  extends Optional<
    IncomingDocumentAttributes,
    | "id"
    | "content"
    | "documentType"
    | "status"
    | "assignedDepartment"
    | "managerOpinion"
    | "deadline"
    | "attachments"
    | "processingHistory"
    | "createdAt"
    | "updatedAt"
  > {}

// IncomingDocument model class
class IncomingDocument
  extends Model<IncomingDocumentAttributes, IncomingDocumentCreationAttributes>
  implements IncomingDocumentAttributes
{
  public id!: number
  public number!: string
  public title!: string
  public receivedDate!: Date
  public sender!: string
  public content!: string
  public documentType!: "official" | "decision" | "directive" | "report" | "plan" | "other"
  public status!: "pending" | "processing" | "completed"
  public assignedDepartment!: string
  public managerOpinion!: string
  public deadline!: Date | null
  public attachments!: Attachment[]
  public processingHistory!: ProcessingHistoryItem[]
  public createdById!: number

  // Timestamps
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Associations
  public readonly createdBy?: User
  public readonly assignedUsers?: User[]
}

IncomingDocument.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receivedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    documentType: {
      type: DataTypes.ENUM("official", "decision", "directive", "report", "plan", "other"),
      defaultValue: "official",
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "completed"),
      defaultValue: "pending",
    },
    assignedDepartment: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    managerOpinion: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    processingHistory: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "IncomingDocument",
    tableName: "incoming_documents",
  },
)

// Define associations
IncomingDocument.belongsTo(User, {
  foreignKey: "createdById",
  as: "createdBy",
})

export default IncomingDocument
