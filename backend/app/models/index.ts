import { Sequelize } from "sequelize";
import dbConfig from "../config/db.config.js";

import UserModel from "./user.model.js";
import RoleModel from "./role.model.js";
import RefreshTokenModel from "./refreshToken.model.js";

interface DB {
  Sequelize: typeof Sequelize;
  sequelize: Sequelize;
  user: ReturnType<typeof UserModel>;
  role: ReturnType<typeof RoleModel>;
  refreshToken: ReturnType<typeof RefreshTokenModel>;
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
  refreshToken: RefreshTokenModel(sequelize),
  ROLES: ["user", "admin", "moderator"],
};

// Run associations for all models that define "associate(db)"
Object.values(db).forEach((model: any) => {
  if (model && typeof model.associate === "function") {
    model.associate(db);
  }
});

export default db;
