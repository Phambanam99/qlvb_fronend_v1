import { Model, DataTypes, type Optional } from "sequelize"
import { sequelize } from "../config/database"
import bcrypt from "bcryptjs"

// User attributes interface
interface UserAttributes {
  id: number
  username: string
  password: string
  fullName: string
  email: string
  department: string
  position: string
  role: "admin" | "manager" | "department_head" | "staff" | "clerk"
  avatar: string
  phone: string
  status: "active" | "inactive"
  createdAt?: Date
  updatedAt?: Date
}

// Interface for User creation attributes
interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "avatar" | "phone" | "status" | "createdAt" | "updatedAt"> {}

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number
  public username!: string
  public password!: string
  public fullName!: string
  public email!: string
  public department!: string
  public position!: string
  public role!: "admin" | "manager" | "department_head" | "staff" | "clerk"
  public avatar!: string
  public phone!: string
  public status!: "active" | "inactive"

  // Timestamps
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Method to compare password
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password)
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "manager", "department_head", "staff", "clerk"),
      defaultValue: "staff",
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    phone: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
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
    modelName: "User",
    tableName: "users",
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
    },
  },
)

export default User
