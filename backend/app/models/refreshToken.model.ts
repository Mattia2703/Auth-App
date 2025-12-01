import { Sequelize, DataTypes, Model } from "sequelize";
import jwt from "jsonwebtoken";
import authConfig from "../config/auth.config.js";

import {
  RefreshTokenAttributes,
  RefreshTokenCreationAttributes,
  RefreshTokenModel,
} from "./refreshToken.types.js";

export class RefreshToken extends Model<
  RefreshTokenAttributes,
  RefreshTokenCreationAttributes
> {
  declare id: number;
  declare token: string;
  declare userId: number;
  declare expiryDate: Date;

  static async createToken(user: any): Promise<string> {
    const expiresInDays = 14;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiresInDays);

    const token = jwt.sign({ id: user.id }, authConfig.refreshSecret, {
      expiresIn: `${expiresInDays}d`,
    });

    const refreshToken = await RefreshToken.create({
      token,
      userId: user.id,
      expiryDate,
    });

    return refreshToken.token;
  }

  static isExpired(rt: RefreshTokenModel): boolean {
    return rt.expiryDate.getTime() < Date.now();
  }
}

export default (sequelize: Sequelize) => {
  RefreshToken.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "refreshTokens",
      modelName: "refreshToken",
    }
  );

  (RefreshToken as any).associate = (db: any) => {
    RefreshToken.belongsTo(db.user, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });

    db.user.hasOne(RefreshToken, {
      foreignKey: "userId",
      as: "refreshToken",
      onDelete: "CASCADE",
    });
  };

  return RefreshToken;
};
