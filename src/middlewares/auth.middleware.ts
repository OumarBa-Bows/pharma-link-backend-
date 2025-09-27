import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../app";
import * as Sentry from "@sentry/node";
import { body, ValidationError, validationResult } from "express-validator";

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.cookies.token ?? req.headers.authorization;

    // Check if Auhorization Header is Missing
    if (!authHeader) {
      logger.error("401 Authorization header is missing");
      Sentry.captureException({
        error: "401 Authorization header is missing",
      });
      return res.status(401).send("Authorization header is missing");
    }

    // Extract Token from Header
    const token = authHeader.split(" ")[1]; // Assumes "Bearer TOKEN"
    const jwtSecretKey = process.env.SUPABASE_JWT_SECRET_KEY!.replace(
      /\\n/g,
      "\n"
    );

    try {
      // Verify JWT authenticity and prints role
      logger.info(`Decoding JWT..`);
      const decoded: jwt.JwtPayload = jwt.verify(token, jwtSecretKey, {
        algorithms: ["HS256"],
      }) as jwt.JwtPayload;
      logger.info(`Role: ${decoded.role}`);

      // 403 if role is not allowed to use this endpoint.
      if (!roles.includes(decoded.role)) {
        Sentry.captureException({
          error: `Insufficient permissions Role: ${decoded.role}`,
        });
        return res.status(403).send("Insufficient permissions");
      }

      // Forward the decoded token to the next middleware or endpoint
      res.locals.user = decoded;
      next();
    } catch (error) {
      logger.error(error);
      if (error instanceof jwt.TokenExpiredError) {
        logger.error("401 Token expired");
        Sentry.captureException({
          error: "401 Token expired",
        });
        return res.status(401).send("Token expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.info("401 Invalid token");
        logger.error(error.message);
        Sentry.captureException({
          error: "Invalid token",
        });
        return res.status(401).send("Invalid token");
      } else {
        logger.error(error);
        Sentry.captureException(error);
        return res
          .status(500)
          .send("An error occurred processing your authentication token");
      }
    }
  };
}

// Fonction générique pour gérer les erreurs de validation
const validate = (req: Request, res: Response, next: () => void) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const loginValidator = [
  body("email").isEmail().withMessage("Un email valide est requis."),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Le mot de passe est requis."),
  validate,
];
