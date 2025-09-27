import { Router } from "express";
import { ArticleController } from "../controllers/ArticleController";
import {
  createArticleValidator,
  updateArticleValidator,
} from "../middlewares/article.middleware";

const articeRoute = Router();
articeRoute.post("/create", createArticleValidator, ArticleController.create);
articeRoute.post(
  "/update/:id",
  updateArticleValidator,
  ArticleController.update
);
articeRoute.get("/get", ArticleController.getAll);
articeRoute.get("/get/:id", ArticleController.getById);
articeRoute.post("/delete/:id", ArticleController.delete);

export default articeRoute;
