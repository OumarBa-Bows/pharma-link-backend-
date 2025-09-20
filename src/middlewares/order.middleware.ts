import { body } from "express-validator";

export const validateCreateOrder = [
  body("order").isObject().withMessage("order est requis"),
  body("order.id_business").isInt().withMessage("order.id_business est requis et doit être un entier"),
  // Ajoute d'autres validations sur order si besoin

  // body("items").isArray({ min: 1 }).withMessage("items doit être un tableau non vide"),
  // body("items.*.quantity").isInt({ min: 1 }).withMessage("items.quantity doit être un entier positif"),
  // body("items.*.id_item").optional().isInt().withMessage("items.id_item doit être un entier"),
  // body("items.*.id_menu").optional().isInt().withMessage("items.id_menu doit être un entier"),
  // body("items.*.product_type").optional().isString().withMessage("items.product_type doit être une chaîne"),

  body("paymentData").optional().isArray(),
  body("paymentData.*.payment_type_id").if(body("paymentData").exists()).isInt().withMessage("payment_type_id doit être un entier"),
  body("paymentData.*.amount").if(body("paymentData").exists()).isNumeric().withMessage("amount doit être un nombre"),
  body("paymentData.*.business_id").if(body("paymentData").exists()).isInt().withMessage("business_id doit être un entier"),
  body("paymentData.*.payment_status").optional().isString().withMessage("payment_status doit être une chaîne"),
  body("paymentData.*.order_id").optional().isInt().withMessage("order_id doit être un entier"),

  body("deliveryData").optional().isObject().withMessage("deliveryData doit être un objet"),
];




export const validateCreateMultiBusinessOrder = [
  body("orders").isArray({ min: 1 }).withMessage("orders must be a non-empty array"),
  body("orders.*.order").isObject().withMessage("Each order must be an object"),
  body("orders.*.order.id_business").isInt().withMessage("order.id_business is required and must be an integer"),
  // Add more validations for order fields as needed

  // body("orders.*.items").isArray({ min: 1 }).withMessage("items must be a non-empty array"),
  // body("orders.*.items.*.quantity").isInt({ min: 1 }).withMessage("items.quantity must be a positive integer"),
  // body("orders.*.items.*.id_item").optional().isInt().withMessage("items.id_item must be an integer"),
  // body("orders.*.items.*.id_menu").optional().isInt().withMessage("items.id_menu must be an integer"),
  // body("orders.*.items.*.product_type").optional().isString().withMessage("items.product_type must be a string"),

  body("orders.*.paymentData").optional().isArray(),
  body("orders.*.paymentData.*.payment_type_id").if(body("orders.*.paymentData").exists()).isInt().withMessage("payment_type_id must be an integer"),
  body("orders.*.paymentData.*.amount").if(body("orders.*.paymentData").exists()).isNumeric().withMessage("amount must be a number"),
  body("orders.*.paymentData.*.business_id").if(body("orders.*.paymentData").exists()).isInt().withMessage("business_id must be an integer"),
  body("orders.*.paymentData.*.payment_status").optional().isString().withMessage("payment_status must be a string"),
  body("orders.*.paymentData.*.order_id").optional().isInt().withMessage("order_id must be an integer"),

  body("orders.*.deliveryData").optional().isObject().withMessage("deliveryData must be an object")
]

export const validateUpdateOrder = [
  body("orderId").isInt().withMessage("orderId est requis et doit être un entier"),
  body("order").isObject().withMessage("order est requis"),
  body("order.id_business").isInt().withMessage("order.id_business est requis et doit être un entier"),
  // Ajoute d'autres validations sur order si besoin

  // body("items").isArray({ min: 1 }).withMessage("items doit être un tableau non vide"),
  // body("items.*.quantity").isInt({ min: 1 }).withMessage("items.quantity doit être un entier positif"),
  // body("items.*.id_item").optional().isInt().withMessage("items.id_item doit être un entier"),
  // body("items.*.id_menu").optional().isInt().withMessage("items.id_menu doit être un entier"),
  // body("items.*.product_type").optional().isString().withMessage("items.product_type doit être une chaîne"),

  body("paymentData").optional().isArray(),
  body("paymentData.*.payment_type_id").if(body("paymentData").exists()).isInt().withMessage("payment_type_id doit être un entier"),
  body("paymentData.*.amount").if(body("paymentData").exists()).isNumeric().withMessage("amount doit être un nombre"),
  body("paymentData.*.business_id").if(body("paymentData").exists()).isInt().withMessage("business_id doit être un entier"),
  body("paymentData.*.payment_status").optional().isString().withMessage("payment_status doit être une chaîne"),
  body("paymentData.*.order_id").optional().isInt().withMessage("order_id doit être un entier"),

  body("deliveryData").optional().isObject().withMessage("deliveryData doit être un objet"),
];

export const validateRejectOrder = [
  body("orderId").isInt().withMessage("orderId est requis et doit être un entier"),
  body("businessInfo").isObject().withMessage("businessInfo est requis"),
  body("businessInfo.name").isString().withMessage("businessInfo.name est requis et doit être une chaîne"),
  body("businessInfo.phone").isString().withMessage("businessInfo.phone est requis et doit être une chaîne"),
];

export const validateConfirmOrder = [
  body("orderId").isInt().withMessage("orderId est requis et doit être un entier")
];

export const validateDispatchOrder = [
  body("orderId").isInt().withMessage("orderId est requis et doit être un entier")
];

export const validateCreateOrderPayment = [

  body("businessId").isInt().withMessage("business_id est requis et doit être un entier"),
  body("orderId").isInt().withMessage("order_id est requis et doit être un entier"),
  body("payment_type_id").isInt().withMessage("payment_type_id est requis et doit être un entier"),
  
  body("amount").exists().isNumeric().withMessage("amount doit être un nombre")

]

export const validateCancelOrderPayment = [

  body("orderId").isInt().withMessage("order_id est requis et doit être un entier"),
  body("order_payment_id").isInt().withMessage("order_payment_id est requis et doit être un entier"),

]