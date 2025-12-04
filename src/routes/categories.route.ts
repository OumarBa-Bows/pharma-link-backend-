import { CategoryController } from "./../controllers/CategoryController";
import { Router } from "express";

const categoryRoute = Router();
categoryRoute.post("/", CategoryController.createCategory);
categoryRoute.post("/update/:id", CategoryController.updateCategory);
categoryRoute.get("/", CategoryController.getCategories);

export default categoryRoute;
