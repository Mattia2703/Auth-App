import { Sequelize } from "sequelize";
import dbConfig from "../config/db.config.js";
import UserModel from "./user.model.js";
import RoleModel from "./role.model.js";

interface DB {
  Sequelize: typeof Sequelize;
  sequelize: Sequelize;
  user: ReturnType<typeof UserModel>;
  role: ReturnType<typeof RoleModel>;
  ROLES: string[];
}

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: dbConfig.pool,
});

const db: DB = {
  Sequelize,
  sequelize,
  user: UserModel(sequelize),
  role: RoleModel(sequelize),
  ROLES: ["user", "admin", "moderator"],
};

Object.values(db).forEach((model: any) => {
  if (model && typeof model.associate === "function") {
    model.associate(db);
  }
});

export default db;
