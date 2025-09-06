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

module.exports = {
  routes,
};
