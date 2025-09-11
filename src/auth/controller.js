const service = require("./service");
const exceptionRaiser = require("../utils/error-handle");

// Utilitaire pour envoyer une réponse de succès
const sendSuccessResponse = (res, data, message = "") => {
  return res.status(200).send({
    success: true,
    message,
    ...data,
  });
};

// Fonction générique pour le traitement asynchrone
const handleAsync = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    console.error("Error in auth.controller: ", error);
    return exceptionRaiser.sendError(error, res);
  }
};

// Login
exports.login = handleAsync(async (req, res) => {
  const body = req.body;
  const { user, accessToken, refreshToken } = await service.login(body);
  // Définir le cookie HTTP-only pour le token d'accès
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: false, // à mettre à true en production avec HTTPS
    sameSite: "strict",
  });
  return sendSuccessResponse(res, { user }, "Login successful");
});

exports.refreshToken = handleAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const accessToken = await service.refreshAccessToken(refreshToken);
  return sendSuccessResponse(res, { accessToken });
});
