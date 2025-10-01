import fileUpload from "express-fileupload";
import "reflect-metadata";
import express, { Application } from "express";
import { envConfig } from "./configs/env.config";
envConfig();

import { IncomingMessage } from "http";

// Extend IncomingMessage to include rawBody
declare module "http" {
  interface IncomingMessage {
    rawBody?: string;
  }
}

import cors from "cors";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";
import winston from "winston";
import * as Sentry from "@sentry/node";
import { DataSource } from "typeorm";
import { AppDataSourceConfig } from "./configs/TypeOrmDataSource";
import mainRouter from "./routes";

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;
// Custom printf format that structures the log as "Timestamp Loglevel Message"
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

export const logger = createLogger({
  transports: [
    new transports.File({
      filename: "error.log",
      level: "error",
      format: format.json(),
    }),
    new transports.Http({
      level: "warn",
      format: format.json(),
    }),
    new transports.Console({
      level: "info",
      format: combine(
        timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
        colorize({ all: false, message: false }),
        logFormat
      ),
    }),
  ],
});

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    },
  }
);

const app: Application = express();
app.use(cookieParser());
app.use(fileUpload());

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:4200,http://localhost,http://127.0.0.1"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// app.use(express.json());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// API routes prefix
app.use("/api", mainRouter);

// Set the port for the server to listen on from environment or default to 3002
const PORT = process.env.PORT || 6345;
export const AppDataSource = new DataSource(AppDataSourceConfig);

// Start the server and log the URL where it is running
import bcrypt from "bcryptjs";
import { getUserRepository } from "./repository/userRepository";
// import { AppDataSource } from "./app";
import { Role } from "./entities/Role.entity";

async function createDefaultAdmin() {
  const userRepo = getUserRepository();
  const roleRepo = AppDataSource.getRepository(Role);

  // Créer les rôles s'ils n'existent pas
  const roleNames = ["admin", "article", "user"];
  const roles: Role[] = [];
  for (const name of roleNames) {
    let role = await roleRepo.findOneBy({ name });
    if (!role) {
      role = roleRepo.create({ name });
      await roleRepo.save(role);
      logger.info(`Rôle '${name}' créé.`);
    }
    roles.push(role);
  }

  // Créer ou mettre à jour l'utilisateur admin
  let admin = await userRepo.findOne({
    where: { email: "admin@gmail.com" },
    relations: ["roles"],
  });
  if (!admin) {
    const hashed = await bcrypt.hash("1234", 10);
    admin = userRepo.create({
      name: "admin",
      email: "admin@gmail.com",
      password: hashed,
      roles,
    });
    await userRepo.save(admin);
    logger.info("Utilisateur admin par défaut créé et rôles assignés.");
  } else {
    // Ajouter les rôles s'ils ne sont pas déjà présents
    const adminRoleNames = admin.roles?.map((r) => r.name) || [];
    let updated = false;
    for (const role of roles) {
      if (!adminRoleNames.includes(role.name)) {
        admin.roles = [...(admin.roles || []), role];
        updated = true;
      }
    }
    if (updated) {
      await userRepo.save(admin);
      logger.info("Rôles ajoutés à l'utilisateur admin existant.");
    } else {
      logger.info("Utilisateur admin déjà existant avec les bons rôles.");
    }
  }
}

async function startServer() {
  try {
    await AppDataSource.initialize();
    // Attendre la création des tables avant d'insérer l'admin
    if (AppDataSource.options.synchronize) {
      // synchronize: true => les tables sont créées automatiquement
      await createDefaultAdmin();
    } else {
      // Si vous utilisez les migrations, placez createDefaultAdmin après l'exécution des migrations
      // await AppDataSource.runMigrations();
      await createDefaultAdmin();
    }
    console.log("Connection to the database established successfully!");
    app.listen(PORT, async () => {
      logger.info(`Server is running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
    Sentry.captureException(error);
  }
}

startServer();
