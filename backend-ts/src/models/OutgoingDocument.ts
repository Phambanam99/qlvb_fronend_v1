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

// History item interface
interface HistoryItem {
  action: string
  actorId: number
  timestamp: Date
  description: string
}

// OutgoingDocument attributes interface
interface OutgoingDocumentAttributes {
  id: number
  number: string
  title: string
  sentDate: Date
  recipient: string
  content: string
  documentType: "official" | "decision" | "directive" | "report" | "plan" | "other"
  status: "draft" | "pending_approval" | "approved" | "sent"
  creatorId: number
  approverId: number | null
  priority: "normal" | "high" | "urgent"
  note: string
  attachments: Attachment[]
  history: HistoryItem[]
  createdAt?: Date
  updatedAt?: Date
}

// Interface for OutgoingDocument creation attributes
interface OutgoingDocumentCreationAttributes
  extends Optional<
    OutgoingDocumentAttributes,
    | "id"
    | "content"
    | "documentType"
    | "status"
    | "approverId"
    | "priority"
    | "note"
    | "attachments"
    | "history"
    | "createdAt"
    | "updatedAt"
  > {}

// OutgoingDocument model class
class OutgoingDocument
  extends Model<OutgoingDocumentAttributes, OutgoingDocumentCreationAttributes>
  implements OutgoingDocumentAttributes
{
  public id!: number
  public number!: string
  public title!: string
  public sentDate!: Date
  public recipient!: string
  public content!: string
  public documentType!: "official" | "decision" | "directive" | "report" | "plan" | "other"
  public status!: "draft" | "pending_approval" | "approved" | "sent"
  public creatorId!: number
  public approverId!: number | null
  public priority!: "normal" | "high" | "urgent"
  public note!: string
  public attachments!: Attachment[]
  public history!: HistoryItem[]

  // Timestamps
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Associations
  public readonly creator?: User
  public readonly approver?: User
}

OutgoingDocument.init(
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
    sentDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    recipient: {
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
      type: DataTypes.ENUM("draft", "pending_approval", "approved", "sent"),
      defaultValue: "draft",
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    approverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    priority: {
      type: DataTypes.ENUM("normal", "high", "urgent"),
      defaultValue: "normal",
    },
    note: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    history: {
      type: DataTypes.JSONB,
      defaultValue: [],
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
    modelName: "OutgoingDocument",
    tableName: "outgoing_documents",
  },
)

// Define associations
OutgoingDocument.belongsTo(User, {
  foreignKey: "creatorId",
  as: "creator",
})

OutgoingDocument.belongsTo(User, {
  foreignKey: "approverId",
  as: "approver",
})

export default OutgoingDocument
