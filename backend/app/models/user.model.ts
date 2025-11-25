import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { RoleModel } from "./role.types.js";

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {
  getRoles: () => Promise<RoleModel[]>;
  setRoles: (roles: RoleModel[] | null, options?: any) => Promise<void>;
}

export default (sequelize: Sequelize) => {
  const User = sequelize.define<UserInstance>("users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: { type: DataTypes.STRING, unique: true },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING },
  });

  // Association function
  (User as any).associate = (db: any) => {
    User.belongsToMany(db.role, {
      through: "user_roles",
      as: "roles",
      foreignKey: "userId",
    });
  };

  return User;
};
