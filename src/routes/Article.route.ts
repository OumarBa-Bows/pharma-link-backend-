import { Router } from "express";
import { ArticleController } from "../controllers/ArticleController";

const articeRoute = Router();
articeRoute.post("/create", ArticleController.create);
articeRoute.post("/update/:id", ArticleController.update);
articeRoute.post("/get/all", ArticleController.getAll);
articeRoute.post("/get/:id", ArticleController.getById);
articeRoute.post("/delete/:id", ArticleController.delete);

export default articeRoute;
