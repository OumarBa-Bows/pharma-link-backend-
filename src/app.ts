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
import { createClient } from "@supabase/supabase-js";
import winston from "winston";
import * as Sentry from "@sentry/node";
import { DataSource } from "typeorm";
import { AppDataSourceConfig } from "./configs/TypeOrmDataSource";
import articeRoute from "./routes/Article.route";
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
app.use(cors());

// app.use(express.json());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// The request handler must be the first middleware on the app
// app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
// app.use(Sentry.Handlers.tracingHandler());

//Order endpoint routes prefix
app.use("/api/article", articeRoute);

// Set the port for the server to listen on from environment or default to 3002
const PORT = process.env.PORT || 6345;
export const AppDataSource = new DataSource(AppDataSourceConfig);

// Start the server and log the URL where it is running
async function startServer() {
  try {
    await AppDataSource.initialize();
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
