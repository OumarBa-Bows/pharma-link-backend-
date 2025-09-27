import { Request, Response, NextFunction } from "express";
import { body, ValidationError, validationResult } from "express-validator";

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
export const createArticleValidator = [
  body("code").notEmpty().withMessage("Le code de l'article est requis."),
  body("name").notEmpty().withMessage("Le nom de l'article est requis."),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Le prix doit être un nombre positif."),
  body("imageLink").optional().isString(),
  body("description").optional().isString(),
  body("expiryDate").optional().isISO8601().toDate(),
  body("barcode").optional().isString(),
  validate,
];

export const updateArticleValidator = [
  body("code")
    .optional()
    .notEmpty()
    .withMessage("Le code de l'article est requis."),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Le nom de l'article est requis."),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Le prix doit être un nombre positif."),
  body("imageLink").optional().isString(),
  body("description").optional().isString(),
  body("expiryDate").optional().isISO8601().toDate(),
  body("barcode").optional().isString(),
  validate,
];
