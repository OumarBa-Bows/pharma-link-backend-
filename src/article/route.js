const express = require("express");
const controller = require("./controller");
const middleware = require("./middleware");
const routes = express.Router({
  mergeParams: true,
});

// Créer un article
routes.post("/", middleware.createArticleInputs(), controller.create);

// Mettre à jour un article
routes.put("/:id", middleware.updateArticleInputs(), controller.update);

// Supprimer un article
routes.delete("/:id", middleware.deleteArticleInputs(), controller.delete);

// Récupérer tous les articles
routes.get("/", controller.getAll);

// Récupérer un article par ID
routes.get("/:id", controller.getById);

module.exports = {
  routes,
};
