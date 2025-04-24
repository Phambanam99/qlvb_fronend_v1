import { Model, DataTypes, type Optional } from "sequelize"
import { sequelize } from "../config/database"
import User from "./User"
import IncomingDocument from "./IncomingDocument"

// Attachment interface
interface Attachment {
  name: string
  path: string
  size: string
  uploadedAt: Date
}

// DocumentResponse attributes interface
interface DocumentResponseAttributes {
  id: number
  documentId: number
  content: string
  attachments: Attachment[]
  status: "draft" | "pending_approval" | "rejected" | "approved"
  createdById: number
  managerComment: string
  approvedById: number | null
  approvedAt: Date | null
  createdAt?: Date
  updatedAt?: Date
}

// Interface for DocumentResponse creation attributes
interface DocumentResponseCreationAttributes
  extends Optional<
    DocumentResponseAttributes,
    "id" | "attachments" | "status" | "managerComment" | "approvedById" | "approvedAt" | "createdAt" | "updatedAt"
  > {}

// DocumentResponse model class
class DocumentResponse
  extends Model<DocumentResponseAttributes, DocumentResponseCreationAttributes>
  implements DocumentResponseAttributes
{
  public id!: number
  public documentId!: number
  public content!: string
  public attachments!: Attachment[]
  public status!: "draft" | "pending_approval" | "rejected" | "approved"
  public createdById!: number
  public managerComment!: string
  public approvedById!: number | null
  public approvedAt!: Date | null

  // Timestamps
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Associations
  public readonly document?: IncomingDocument
  public readonly createdBy?: User
  public readonly approvedBy?: User
}

DocumentResponse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "incoming_documents",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM("draft", "pending_approval", "rejected", "approved"),
      defaultValue: "draft",
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    managerComment: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    approvedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: "DocumentResponse",
    tableName: "document_responses",
  },
)

// Define associations
DocumentResponse.belongsTo(IncomingDocument, {
  foreignKey: "documentId",
  as: "document",
})

DocumentResponse.belongsTo(User, {
  foreignKey: "createdById",
  as: "createdBy",
})

DocumentResponse.belongsTo(User, {
  foreignKey: "approvedById",
  as: "approvedBy",
})

IncomingDocument.hasMany(DocumentResponse, {
  foreignKey: "documentId",
  as: "responses",
})

export default DocumentResponse
