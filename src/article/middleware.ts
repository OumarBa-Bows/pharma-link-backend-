import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// fonction pour gérer les erreurs de validation
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation pour la création d'article
export const validateCreate = [
  body('code').notEmpty().withMessage('The code is required'),
  body('name').notEmpty().withMessage('The name is required'),
  body('price').isFloat({ gt: 0 }).withMessage('The price must be a positive number'),
  body('imageLink').optional().isString().withMessage('The imageLink must be a string'),
  body('description').optional().isString().withMessage('The description must be a string'),
  body('expiryDate').optional().isISO8601().withMessage('The expiryDate must be a valid date'),
  body('barcode').optional().isString().withMessage('The barcode must be a string'),
  validate,
];

// Validation pour la mise à jour d'article
export const validateUpdate = [
  body('code').optional().notEmpty().withMessage('The code must not be empty if provided'),
  body('name').optional().notEmpty().withMessage('The name must not be empty if provided'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('The price must be a positive number if provided'),
  body('imageLink').optional().isString().withMessage('The imageLink must be a string'),
  body('description').optional().isString().withMessage('The description must be a string'),
  body('expiryDate').optional().isISO8601().withMessage('The expiryDate must be a valid date'),
  body('barcode').optional().isString().withMessage('The barcode must be a string'),
  validate,
];

// Validation pour la suppression d'article (id paramètre d'URL)
export const validateDelete = [
  param('id').notEmpty().withMessage('The article ID is required'),
  validate,
];
