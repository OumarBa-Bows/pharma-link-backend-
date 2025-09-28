import { Router } from "express";
import { ArticleController } from "../controllers/ArticleController";
import {
  createArticleValidator,
  updateArticleValidator,
} from "../middlewares/article.middleware";

const articeRoute = Router();
articeRoute.post("/", createArticleValidator, ArticleController.create);
articeRoute.post(
  "/update/:id",
  updateArticleValidator,
  ArticleController.update
);
articeRoute.get("/", ArticleController.getAll);
articeRoute.get("/:id", ArticleController.getById);
articeRoute.get("/delete/:id", ArticleController.delete);

export default articeRoute;
