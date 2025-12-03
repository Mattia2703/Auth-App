import db from "../models/index.js";
import authConfig from "../config/auth.config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { UserModel } from "../models/user.types.js";
import { RefreshToken } from "../models/refreshToken.model.js";
import { RefreshTokenModel } from "../models/refreshToken.types.js";

const User = db.user;
const Role = db.role;

export const signup = async (req: Request, res: Response) => {
  try {
    if (!req.body.password || !req.body.username || !req.body.email) {
      res.status(500).json({ message: "Missing information!" });
      return;
    }

    if (req.body.password.length < 6) {
      res
        .status(500)
        .json({ message: "Password must be longer than 6 characters!" });
      return;
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = (await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    })) as UserModel;

    const role = await Role.findOne({ where: { name: "user" } });
    await user.setRoles([role]);

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const user = (await User.findOne({
      where: { username: req.body.username },
    })) as UserModel | null;

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const passwordIsValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    // Create access token (short-lived)
    const accessToken = jwt.sign({ id: user.id }, authConfig.secret, {
      expiresIn: "20m",
    });

    // Create regresh token (long-lived)
    const refreshToken = await RefreshToken.createToken(user);

    console.log(refreshToken);

    const roles = await user.getRoles();
    const authorities = roles.map((role) => `ROLE_${role.name.toUpperCase()}`);

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const requestToken = req.body.refreshToken;

    if (!requestToken) {
      return res.status(403).json({ message: "Refresh token is required" });
    }

    const tokenEntry = (await RefreshToken.findOne({
      where: { token: requestToken },
    })) as RefreshTokenModel;

    if (!tokenEntry) {
      return res.status(403).json({ message: "Refresh token not found" });
    }

    // Check expiry
    if (RefreshToken.isExpired(tokenEntry)) {
      await RefreshToken.destroy({ where: { id: tokenEntry.id } });

      return res.status(403).json({
        message: "Refresh token expired. Please log in again.",
      });
    }

    // Create a new access token
    const newAccessToken = jwt.sign(
      { id: tokenEntry.userId },
      authConfig.secret,
      { expiresIn: "20m" }
    );

    // Rotate refresh token
    const user = await tokenEntry.getUser();
    const newRefreshToken = await RefreshToken.createToken(user);

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
};
