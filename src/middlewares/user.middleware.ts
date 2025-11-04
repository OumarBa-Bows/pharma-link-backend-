import { Request, Response, NextFunction } from "express";
import { body, ValidationError, validationResult } from "express-validator";

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const createUserValidator = [
  body("name").notEmpty().withMessage("User name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("password").notEmpty().withMessage("Password is required."),
  validate,
];

export const updateUserValidator = [
  body("name").optional().notEmpty().withMessage("User name is required."),
  body("email").optional().isEmail().withMessage("Valid email is required."),
  body("password").optional().notEmpty().withMessage("Password is required."),
  validate,
];

export const updateUserPasswordValidator = [
  body("newPassword").notEmpty().withMessage("New password is required."),
  validate,
];
