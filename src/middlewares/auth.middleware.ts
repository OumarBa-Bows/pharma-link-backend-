import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../app";
import * as Sentry from "@sentry/node";
import { body, ValidationError, validationResult } from "express-validator";

// Helper: extrait le token de la requête (cookie ou header)
function getTokenFromRequest(req: Request): string | undefined {
  // if (req.cookies.token) return req.cookies.token;
  const authHeader = req.headers.authorization;
  console.log(`Token ${authHeader}`);
  if (authHeader)
    return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  return undefined;
}

// Helper: extrait les rôles du payload JWT (supporte string ou string[])
function getUserRolesFromPayload(payload: any): string[] {
  if (Array.isArray(payload.roles)) return payload.roles;
  if (typeof payload.role === "string") return [payload.role];
  return [];
}

// Helper: vérifie et décode le token JWT, lève une erreur si invalide
function verifyAndDecodeToken(token: string): jwt.JwtPayload {
  const jwtSecretKey = process.env.SUPABASE_JWT_SECRET_KEY!.replace(
    /\n/g,
    "\n"
  );
  return jwt.verify(token, jwtSecretKey, {
    algorithms: ["HS256"],
  }) as jwt.JwtPayload;
}

// Helper: vérifie si l'utilisateur possède au moins un des rôles requis
function checkUserRoles(userRoles: string[], requiredRoles: string[]): boolean {
  if (requiredRoles.length === 0) return true;
  return userRoles.some((r) => requiredRoles.includes(r));
}

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // JUST TESTING

    const token = getTokenFromRequest(req);
    if (!token) {
      logger.warn("401 Authorization token is missing");
      Sentry.captureException("401 Authorization token is missing");
      return res.status(401).send("Authorization token is missing");
    }

    try {
      const decoded = verifyAndDecodeToken(token);
      const userRoles = getUserRolesFromPayload(decoded);
      logger.info(`User roles: ${userRoles} | Required: ${roles}`);
      if (roles.length != 0 && !checkUserRoles(userRoles, roles)) {
        Sentry.captureException(
          `403 Insufficient permissions. User roles: ${userRoles}`
        );
        return res.status(403).send("Insufficient permissions");
      }
      res.locals.user = decoded;

      next();
    } catch (error: any) {
      console.error(error);
      logger.error(error);
      if (error instanceof jwt.TokenExpiredError) {
        Sentry.captureException("401 Token expired");
        return res.status(401).send("Token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        Sentry.captureException("401 Invalid token");
        return res.status(401).send("Invalid token");
      }
      Sentry.captureException(error);
      return res
        .status(500)
        .send("An error occurred processing your authentication token");
    }
  };
}

// Fonction générique pour gérer les erreurs de validation
const validate = (req: Request, res: Response, next: NextFunction) => {
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
