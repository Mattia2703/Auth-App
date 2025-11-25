import { Model, InferAttributes, InferCreationAttributes } from "sequelize";

export interface RoleModel
  extends Model<
    InferAttributes<RoleModel>,
    InferCreationAttributes<RoleModel>
  > {
  id: number;
  name: string;
}
