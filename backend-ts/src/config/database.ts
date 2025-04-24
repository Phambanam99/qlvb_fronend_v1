import { Sequelize } from "sequelize"

const dbName = process.env.DB_NAME || "document_management"
const dbUser = process.env.DB_USER || "postgres"
const dbPassword = process.env.DB_PASSWORD || "postgres"
const dbHost = process.env.DB_HOST || "localhost"
const dbPort = Number.parseInt(process.env.DB_PORT || "5432")

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})
