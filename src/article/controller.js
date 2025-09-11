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
    console.error("Error in article.controller: ", error);
    return exceptionRaiser.sendError(error, res);
  }
};

// Créer un article
exports.create = handleAsync(async (req, res) => {
  const body = req.body;
  const article = await service.createArticle(body);
  return sendSuccessResponse(res, { article }, "Article created successfully");
});

// Mettre à jour un article
exports.update = handleAsync(async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const article = await service.updateArticle(Number(id), body);
  return sendSuccessResponse(res, { article }, "Article updated successfully");
});

// Supprimer un article
exports.delete = handleAsync(async (req, res) => {
  const { id } = req.params;
  const article = await service.deleteArticle(Number(id));
  return sendSuccessResponse(res, { article }, "Article deleted successfully");
});

// Récupérer tous les articles
exports.getAll = handleAsync(async (req, res) => {
  const articles = await service.getAllArticles();
  return sendSuccessResponse(
    res,
    { articles },
    "Articles retrieved successfully"
  );
});

// Récupérer un article par ID
exports.getById = handleAsync(async (req, res) => {
  const { id } = req.params;
  const article = await service.getArticleById(Number(id));
  return sendSuccessResponse(
    res,
    { article },
    "Article retrieved successfully"
  );
});
