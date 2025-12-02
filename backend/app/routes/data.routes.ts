import express from "express";
import { authJwt } from "../middlewares/index.js";
import {
  getCurrentWeather,
  getEURtoUSDRange,
  getFlightByNumber,
} from "../controllers/data.controller.js";

const router = express.Router();

// Test route
router.get("/", [authJwt.verifyToken], () => console.log("test"));

// Get current weather data (requires latitude and longitude as query params)
router.get("/weather", [authJwt.verifyToken], getCurrentWeather);

// Get current EUR to USD conversion
router.get("/exchange", [authJwt.verifyToken], getEURtoUSDRange);

//Track data for any given flight
router.get("/flight", [authJwt.verifyToken], getFlightByNumber);

export default router;
