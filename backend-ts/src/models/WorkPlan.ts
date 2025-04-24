import { Model, DataTypes, type Optional } from "sequelize"
import { sequelize } from "../config/database"
import User from "./User"

// Task interface
interface Task {
  title: string
  description: string
  assignedToId: number
  startDate: Date
  endDate: Date
  status: "pending" | "in_progress" | "completed"
}

// Attachment interface
interface Attachment {
  name: string
  path: string
  size: string
  uploadedAt: Date
}

// WorkPlan attributes interface
interface WorkPlanAttributes {
  id: number
  title: string
  department: string
  startDate: Date
  endDate: Date
  description: string
  status: "planned" | "in_progress" | "completed"
  tasks: Task[]
  attachments: Attachment[]
  createdById: number
  createdAt?: Date
  updatedAt?: Date
}

// Interface for WorkPlan creation attributes
interface WorkPlanCreationAttributes
  extends Optional<
    WorkPlanAttributes,
    "id" | "description" | "status" | "tasks" | "attachments" | "createdAt" | "updatedAt"
  > {}

// WorkPlan model class
class WorkPlan extends Model<WorkPlanAttributes, WorkPlanCreationAttributes> implements WorkPlanAttributes {
  public id!: number
  public title!: string
  public department!: string
  public startDate!: Date
  public endDate!: Date
  public description!: string
  public status!: "planned" | "in_progress" | "completed"
  public tasks!: Task[]
  public attachments!: Attachment[]
  public createdById!: number

  // Timestamps
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Associations
  public readonly createdBy?: User
}

WorkPlan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    status: {
      type: DataTypes.ENUM("planned", "in_progress", "completed"),
      defaultValue: "planned",
    },
    tasks: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    attachments: {
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
    modelName: "WorkPlan",
    tableName: "work_plans",
  },
)

// Define associations
WorkPlan.belongsTo(User, {
  foreignKey: "createdById",
  as: "createdBy",
})

export default WorkPlan
