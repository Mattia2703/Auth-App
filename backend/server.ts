import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import db from "./app/models/index.js";
import authRoutes from "./app/routes/auth.routes.js";
import dataRoutes from "./app/routes/data.routes.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import cookieParser from "cookie-parser";

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
};

app.use(cors(corsOptions));

app.use(cookieParser());

const swaggerDocument = YAML.load("./openapi.yaml");

// Swagger UI route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Simple route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Node.js JWT Authentication application.",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);

// Set port, listen for requests
const PORT = process.env.PORT || 8080;

const initializeRoles = async () => {
  const roles = ["user", "moderator", "admin"];
  for (const role of roles) {
    await db.role.findOrCreate({
      where: { name: role },
    });
  }
};

db.sequelize.sync().then(async () => {
  await initializeRoles();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});
