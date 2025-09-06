const { body, validationResult, param } = require("express-validator");

// Fonction générique pour gérer les erreurs de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation pour la création d'article
exports.createArticleInputs = () => [
  body("title").notEmpty().withMessage("The title is required"),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("The price must be a positive number"),
  validate,
];

// Validation pour la mise à jour d'article
exports.updateArticleInputs = () => [
  body("title")
    .optional()
    .notEmpty()
    .withMessage("The title must not be empty if provided"),
  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("The price must be a positive number if provided"),
  validate,
];

// Validation pour la suppression d'article (id paramètre d'URL)
exports.deleteArticleInputs = () => [
  param("id").notEmpty().withMessage("The article ID is required"),
  validate,
];
