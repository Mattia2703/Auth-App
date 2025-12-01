import express from "express";
import { moderatorBoard } from "../controllers/user.controller.js";
import { authJwt } from "../middlewares/index.js";

const router = express.Router();

router.get("/", [authJwt.verifyToken, authJwt.isModerator], test());

export default router;
