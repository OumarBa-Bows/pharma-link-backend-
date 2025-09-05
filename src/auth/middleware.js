const { body, validationResult } = require("express-validator");

// Fonction générique pour gérer les erreurs de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation des entrées pour la connexion
exports.loginInputs = () => {
  return [
    body("email").notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ];
};

// Validation des entrées pour le refresh token
exports.refreshTokenInputs = () => {
  return [
    body("refreshToken").notEmpty().withMessage("Refresh token is required"),
    validate,
  ];
};
