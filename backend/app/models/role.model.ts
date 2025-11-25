import { Sequelize, DataTypes, Model } from "sequelize";

export interface RoleModel extends Model {
  id: number;
  name: string;
}

export default (sequelize: Sequelize) => {
  const Role = sequelize.define<RoleModel>("roles", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true },
  });

  // Association function
  (Role as any).associate = (db: any) => {
    Role.belongsToMany(db.user, {
      through: "user_roles",
      as: "users",
      foreignKey: "roleId",
    });
  };

  return Role;
};
