import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const createListingValidator = [
  body("name").notEmpty().withMessage("Le nom du listing est requis."),
  body("description").optional().isString(),
  body("date")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("La date doit être au format ISO8601."),
  body("articles")
    .isArray({ min: 1 })
    .withMessage(
      "Le champ 'articles' doit être un tableau contenant au moins un article."
    ),
  body("articles.*.articleId")
    .notEmpty()
    .isUUID()
    .withMessage("Chaque article doit contenir un identifiant (UUID) valide."),
  validate,
];

export const updateListingValidator = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Le nom du listing est requis."),
  body("description").optional().isString(),
  body("date")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("La date doit être au format ISO8601."),
  body("articles")
    .optional()
    .isArray()
    .withMessage("Le champ 'articles' doit être un tableau."),
  body("articles.*.articleId")
    .optional()
    .isUUID()
    .withMessage("Chaque article doit contenir un identifiant (UUID) valide."),
  validate,
];
