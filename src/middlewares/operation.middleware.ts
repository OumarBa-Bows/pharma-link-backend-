import { body } from "express-validator";

export const validateCashInOperation = [

  body("business_id").isInt().withMessage("business_id est requis et doit être un entier"),

  body("order_id").optional().isInt(),
  body("amount").exists().isNumeric().withMessage("amount doit être un nombre"),

  body("nature").optional().isString().withMessage("nature doit être une chaîne"),
  body("reason")
    .exists({ checkFalsy: true }).withMessage("reason est requis")
    .isString().withMessage("reason doit être une chaîne de caractères")
    .isLength({ max: 255 }).withMessage("reason ne peut pas dépasser 255 caractères")
    .custom((value) => {
      const letters = (value.match(/\p{L}/gu) || []).length; // compte seulement les lettres
      if (letters < 5) throw new Error("reason doit contenir au moins 5 lettres");
      return true;
    }),
];

export const validateCashOutOperation = [

  body("business_id").isInt().withMessage("business_id est requis et doit être un entier"),

  body("order_id").optional().isInt(),
  body("amount").exists().isNumeric().withMessage("amount doit être un nombre"),
  body("nature").optional().isString().withMessage("nature doit être une chaîne"),
   body("reason")
    .exists({ checkFalsy: true }).withMessage("reason est requis")
    .isString().withMessage("reason doit être une chaîne de caractères")
    .isLength({ max: 255 }).withMessage("reason ne peut pas dépasser 255 caractères")
    .custom((value) => {
      const letters = (value.match(/\p{L}/gu) || []).length; // compte seulement les lettres
      if (letters < 5) throw new Error("reason doit contenir au moins 5 lettres");
      return true;
    }),
];

export const validateOrderPaymentperation = [

  body("business_id").isInt().withMessage("business_id est requis et doit être un entier"),

  body("order_id").optional().isInt(),
  body("amount").exists().isNumeric().withMessage("amount doit être un nombre"),
  body("nature").optional().isString().withMessage("nature doit être une chaîne"),
];