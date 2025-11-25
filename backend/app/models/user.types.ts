import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  HasManyGetAssociationsMixin,
} from "sequelize";
import { RoleModel } from "./role.types.js";

export interface UserModel
  extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
  > {
  id: number;
  username: string;
  email: string;
  password: string;

  getRoles: HasManyGetAssociationsMixin<RoleModel>;
  setRoles: (newRoles: Array<RoleModel | null>, options?: any) => Promise<void>;
}
