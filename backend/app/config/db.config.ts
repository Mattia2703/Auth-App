import { Dialect } from "sequelize";

export default {
  HOST: "localhost",
  USER: "mattia",
  PASSWORD: process.env.PG_PASSWORD,
  DB: "mattia",
  dialect: "postgres" as Dialect,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
