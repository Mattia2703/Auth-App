import jwt from "jsonwebtoken";
import db from "../models/index.js";
import authConfig from "../config/auth.config.js";
import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.types.js";

interface AuthTokenPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const User = db.user;

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Try to get token from multiple sources
  // 1. Try cookies first (httpOnly cookies from Next.js)
  let token = req.cookies?.accessToken;

  // 2. Fallback to headers (for API clients that don't use cookies)
  if (!token) {
    const tokenHeader =
      req.headers["x-access-token"] || req.headers["authorization"];
    token = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader;

    // Remove "Bearer " prefix if present
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7);
    }
  }

  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  jwt.verify(token as string, authConfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    const payload = decoded as AuthTokenPayload;
    req.userId = payload.id;
    next();
  });
};

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = ((await User.findByPk(req.userId)) as UserModel) || undefined;
    if (!user) return res.status(403).json({ message: "No User ID!" });
    const roles = await user.getRoles();

    for (const role of roles) {
      if (role.name === "admin") {
        return next();
      }
    }

    return res.status(403).json({ message: "Require Admin Role!" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
};

const isModerator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = ((await User.findByPk(req.userId)) as UserModel) || undefined;
    if (!user) return res.status(403).json({ message: "No User ID!" });
    const roles = await user.getRoles();

    for (const role of roles) {
      if (role.name === "moderator") {
        return next();
      }
    }

    return res.status(403).json({ message: "Require Moderator Role!" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
};

const isModeratorOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = ((await User.findByPk(req.userId)) as UserModel) || undefined;
    if (!user) return res.status(403).json({ message: "No User ID!" });
    const roles = await user.getRoles();

    for (const role of roles) {
      if (role.name === "moderator" || role.name === "admin") {
        return next();
      }
    }

    return res
      .status(403)
      .json({ message: "Require Moderator or Admin Role!" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
  isModeratorOrAdmin,
};

export default authJwt;
