import { Model, DataTypes, type Optional } from "sequelize"
import { sequelize } from "../config/database"
import User from "./User"
import IncomingDocument from "./IncomingDocument"

// DocumentAssignment attributes interface
interface DocumentAssignmentAttributes {
  id: number
  documentId: number
  userId: number
  assignedById: number
  assignedAt: Date
  status: "pending" | "in_progress" | "completed"
  createdAt?: Date
  updatedAt?: Date
}

// Interface for DocumentAssignment creation attributes
interface DocumentAssignmentCreationAttributes
  extends Optional<DocumentAssignmentAttributes, "id" | "assignedAt" | "status" | "createdAt" | "updatedAt"> {}

// DocumentAssignment model class
class DocumentAssignment
  extends Model<DocumentAssignmentAttributes, DocumentAssignmentCreationAttributes>
  implements DocumentAssignmentAttributes
{
  public id!: number
  public documentId!: number
  public userId!: number
  public assignedById!: number
  public assignedAt!: Date
  public status!: "pending" | "in_progress" | "completed"

  // Timestamps
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Associations
  public readonly document?: IncomingDocument
  public readonly user?: User
  public readonly assignedBy?: User
}

DocumentAssignment.init(
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    assignedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "completed"),
      defaultValue: "pending",
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
    modelName: "DocumentAssignment",
    tableName: "document_assignments",
  },
)

// Define associations
DocumentAssignment.belongsTo(IncomingDocument, {
  foreignKey: "documentId",
  as: "document",
})

DocumentAssignment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
})

DocumentAssignment.belongsTo(User, {
  foreignKey: "assignedById",
  as: "assignedBy",
})

IncomingDocument.hasMany(DocumentAssignment, {
  foreignKey: "documentId",
  as: "assignments",
})

User.hasMany(DocumentAssignment, {
  foreignKey: "userId",
  as: "assignedDocuments",
})

export default DocumentAssignment
