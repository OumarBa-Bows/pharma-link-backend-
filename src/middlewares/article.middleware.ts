import { Request, Response, NextFunction } from "express";
import { body, ValidationError, validationResult } from "express-validator";

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const uploadExcelValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = (req as any).files;
  if (!files || !files.file) {
    return res
      .status(400)
      .json({ error_name: "file_missing", msg: "Le fichier Excel est requis (champ 'file')." });
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

// Validator pour l'image
export const imageValidator = (req: Request, res: Response, next: NextFunction) => {
  const files = (req as any).files;
  if (!files || !files.image) return next();

  const file = Array.isArray(files.image) ? files.image[0] : files.image;
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  const maxSize = 1024 * 1024; // 1MB

  if (!allowed.includes(file.mimetype)) {
    return res.status(400).json({ error_name:'image_type_invalid',msg: "L'image doit être au format JPEG, PNG ou WEBP." });
  }

  if (file.size > maxSize) {
    return res.status(400).json({ error_name:'image_size_invalid',msg: "L'image ne doit pas dépasser 1MB." });
  }

  next();
};

export const createArticleValidator = [
  body("code").notEmpty().withMessage("Le code de l'article est requis."),
  body("name").notEmpty().withMessage("Le nom de l'article est requis."),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Le prix doit être un nombre positif."),
  body("image")
    .optional()
    .custom((_, { req }) => {
      const files = (req as any).files;
      if (!files || !files.image) return true;
      const file = Array.isArray(files.image) ? files.image[0] : files.image;
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.mimetype)) {
        throw new Error("L'image doit être au format JPEG, PNG ou WEBP.");
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("L'image ne doit pas dépasser 5MB.");
      }
      return true;
    }),
  body("description").optional().isString(),
  body("expiryDate").optional().isString(),
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
 
  body("description").optional().isString(),
  body("expiryDate").optional().isString(),
  body("barcode").optional().isString(),
  validate,
];
