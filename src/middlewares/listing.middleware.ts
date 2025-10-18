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
     .isString()
    .withMessage("La date doit être au format ISO8601."),
  body("articleIds")
    .isArray({ min: 1 })
    .withMessage(
      "Le champ 'articleIds' doit être un tableau contenant au moins un article."
    ),
  body("articleIds.*")
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
    .isString()
    .withMessage("La date doit être au format ISO8601."),
  body("articleIds")
    .optional()
    .isArray()
    .withMessage("Le champ 'articleIds' doit être un tableau."),
  body("articleIds.*")
    .optional()
    .isUUID()
    .withMessage("Chaque article doit contenir un identifiant (UUID) valide."),
  validate,
];
