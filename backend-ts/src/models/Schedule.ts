import { Model, DataTypes, type Optional } from "sequelize"
import { sequelize } from "../config/database"
import User from "./User"

// Schedule item interface
interface ScheduleItem {
  title: string
  date: Date
  startTime: string
  endTime: string
  location: string
  type: "internal" | "external" | "online" | "field"
  participants: string[]
  description: string
}

// Schedule attributes interface
interface ScheduleAttributes {
  id: number
  title: string
  department: string
  period: "day" | "week" | "month"
  startDate: Date
  endDate: Date
  description: string
  status: "pending" | "approved" | "rejected"
  items: ScheduleItem[]
  creatorId: number
  approverId: number | null
  approvedAt: Date | null
  comments: string
  createdAt?: Date
  updatedAt?: Date
}

// Interface for Schedule creation attributes
interface ScheduleCreationAttributes
  extends Optional<
    ScheduleAttributes,
    | "id"
    | "period"
    | "description"
    | "status"
    | "items"
    | "approverId"
    | "approvedAt"
    | "comments"
    | "createdAt"
    | "updatedAt"
  > {}

// Schedule model class
class Schedule extends Model<ScheduleAttributes, ScheduleCreationAttributes> implements ScheduleAttributes {
  public id!: number
  public title!: string
  public department!: string
  public period!: "day" | "week" | "month"
  public startDate!: Date
  public endDate!: Date
  public description!: string
  public status!: "pending" | "approved" | "rejected"
  public items!: ScheduleItem[]
  public creatorId!: number
  public approverId!: number | null
  public approvedAt!: Date | null
  public comments!: string

  // Timestamps
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Associations
  public readonly creator?: User
  public readonly approver?: User
}

Schedule.init(
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
    period: {
      type: DataTypes.ENUM("day", "week", "month"),
      defaultValue: "week",
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
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    items: {
      type: DataTypes.JSONB,
      defaultValue: [],
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
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      defaultValue: "",
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
    modelName: "Schedule",
    tableName: "schedules",
  },
)

// Define associations
Schedule.belongsTo(User, {
  foreignKey: "creatorId",
  as: "creator",
})

Schedule.belongsTo(User, {
  foreignKey: "approverId",
  as: "approver",
})

export default Schedule
