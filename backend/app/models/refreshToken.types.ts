import { Model, Optional } from "sequelize";
import { UserModel } from "./user.types.js";

export interface RefreshTokenAttributes {
  id: number;
  token: string;
  userId: number;
  expiryDate: Date;
}

export interface RefreshTokenCreationAttributes
  extends Optional<RefreshTokenAttributes, "id"> {}

export interface RefreshTokenModel
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>,
    RefreshTokenAttributes {
  getUser: () => Promise<UserModel>;
  setUser: (user: UserModel | null) => Promise<void>;
}
