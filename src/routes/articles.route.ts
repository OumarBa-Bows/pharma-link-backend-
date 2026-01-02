import { Router } from "express";
import { ArticleController } from "../controllers/ArticleController";
import {
  createArticleValidator,
  updateArticleValidator,
  imageValidator,
  uploadExcelValidator,
} from "../middlewares/article.middleware";

const articleRoute = Router();
articleRoute.post(
  "/",
  createArticleValidator,
  imageValidator,
  ArticleController.create
);
articleRoute.post(
  "/update/:id",
  updateArticleValidator,
  imageValidator,
  ArticleController.update
);
articleRoute.get("/", ArticleController.getAll);
articleRoute.get("/paginated/limit", ArticleController.getPerPage);
articleRoute.get("/:id", ArticleController.getById);
articleRoute.get("/delete/:id", ArticleController.delete);
articleRoute.post("/upload", uploadExcelValidator, ArticleController.upload);
articleRoute.get("/categories/get", ArticleController.getCategories);
articleRoute.get("/set/publish/:id", ArticleController.togglePublishStatus);
articleRoute.post("/add/remise/:id", ArticleController.addRemiseToArticle);
articleRoute.put(
  "/update/remise/:id/:remiseId",
  ArticleController.updateRemiseInArticle
);
articleRoute.delete(
  "/remove/remise/:id/:remiseId",
  ArticleController.removeRemiseFromArticle
);

articleRoute.get("/remises/get/:id", ArticleController.getArticleRemises);
export default articleRoute;
