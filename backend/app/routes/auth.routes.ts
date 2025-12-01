import express from "express";
import { signup, signin, refresh } from "../controllers/auth.controller.js";
import { verifySignUp } from "../middlewares/index.js";

const router = express.Router();

// Signup Route
router.post(
  "/signup",
  [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted],
  signup
);

// Signin Route
router.post("/signin", signin);

// Signin Route
router.post("/refresh-token", refresh);

export default router;
