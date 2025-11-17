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

export const uploadExcelValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = (req as any).files;
  if (!files || !files.file) {
    return res
      .status(400)
      .json({
        error_name: "file_missing",
        msg: "Le fichier Excel est requis (champ 'file').",
      });
  }

  const file = Array.isArray(files.file) ? files.file[0] : files.file;
  const allowed = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowed.includes(file.mimetype)) {
    return res.status(400).json({
      error_name: "file_type_invalid",
      msg: "Le fichier doit être un Excel (.xlsx/.xls).",
    });
  }

  if (file.size > maxSize) {
    return res.status(400).json({
      error_name: "file_size_invalid",
      msg: "Le fichier ne doit pas dépasser 5MB.",
    });
  }

  next();
};
