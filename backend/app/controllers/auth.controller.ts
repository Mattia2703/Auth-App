import db from "../models/index.js";
import authConfig from "../config/auth.config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { UserModel } from "../models/user.types.js";

const User = db.user;
const Role = db.role;

export const signup = async (req: Request, res: Response) => {
  try {
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
    // Find user by username
    const user = (await User.findOne({
      where: {
        username: req.body.username,
      },
    })) as UserModel;

    if (!user) {
      return res.status(404).json({ message: "User Not found." });
    }

    // Validate password
    const passwordIsValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    console.log(authConfig.secret);

    // Generate JWT
    const token = jwt.sign({ id: user.id }, authConfig.secret, {
      expiresIn: 86400, // 24 hours
    });

    // Get user roles
    const roles = await user.getRoles();
    const authorities = roles.map((role) => `ROLE_${role.name.toUpperCase()}`);

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
};
