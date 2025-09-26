import { body } from 'express-validator';
import { ItemPreparationStatus } from '../enums/ItemPreparationStatus'; // ajuste le chemin

export const validateItemVirtualCreation = [
  body('menu_item_id')
    .exists({ checkFalsy: true })
    .withMessage('menu_item_id is required')
    .isInt({ gt: 0 })
    .withMessage('menu_item_id must be a positive integer'),

  body('prepartion_time')
    .exists({ checkFalsy: true })
    .withMessage('prepartion_time is required')
    .isInt({ gt: 0 })
    .withMessage('prepartion_time must be a non-negative integer'),

  body('quantity')
    .exists({ checkFalsy: true })
    .withMessage('quantity is required')
    .isFloat({ min: 1 })
    .withMessage('quantity must be a non-negative number'),

  body('business_id')
    .exists({ checkFalsy: true })
    .withMessage('business_id  item is required')
    .isInt({ gt: 0 })
    .withMessage('business_id must be a positive integer'),

  body('status')
    .optional({ nullable: true })
    .isIn(Object.values(ItemPreparationStatus))
    .withMessage(`status must be one of ${Object.values(ItemPreparationStatus).join(', ')}`),
];


export const validateItemVirtualEdit = [

    body('id')
    .exists({ checkFalsy: true })
    .withMessage('id is required')
    .isInt({ gt: 0 })
    .withMessage('id must be a positive integer'),
  
  body('menu_item_id')
    .exists({ checkFalsy: true })
    .withMessage('menu_item_id is required')
    .isInt({ gt: 0 })
    .withMessage('menu_item_id must be a positive integer'),

  body('prepartion_time')
    .exists({ checkFalsy: true })
    .withMessage('prepartion_time is required')
    .isInt({ gt: 0 })
    .withMessage('prepartion_time must be a non-negative integer'),

  body('quantity')
    .exists({ checkFalsy: true })
    .withMessage('quantity is required')
    .isFloat({ min: 1 })
    .withMessage('quantity must be a non-negative number'),

  body('business_id')
    .exists({ checkFalsy: true })
    .withMessage('business_id  item is required')
    .isInt({ gt: 0 })
    .withMessage('business_id must be a positive integer'),

  body('status')
    .optional({ nullable: true })
    .isIn(Object.values(ItemPreparationStatus))
    .withMessage(`status must be one of ${Object.values(ItemPreparationStatus).join(', ')}`),
];

export const validateItemVirtualCompletion = [
  body('id')
    .exists({ checkFalsy: true })
    .withMessage('virtual id item is required')
    .isInt({ gt: 0 })
    .withMessage('virtual id  must be a positive integer'),

   body('business_id')
    .exists({ checkFalsy: true })
    .withMessage('business_id  item is required')
    .isInt({ gt: 0 })
    .withMessage('business_id must be a positive integer'),

]

export const validateFetchInPreparationItemVirtual = [

   body('business_id')
    .exists({ checkFalsy: true })
    .withMessage('business_id  item is required')
    .isInt({ gt: 0 })
    .withMessage('business_id must be a positive integer'),

]