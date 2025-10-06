import { Router } from "express";
import { UserController } from "../controllers/UserController";

const userRoute = Router();
userRoute.post("/", UserController.create);
userRoute.post("/update/:id", UserController.update);
userRoute.get("/", UserController.getAll);
userRoute.get("/:id", UserController.getById);
userRoute.get("/delete/:id", UserController.delete);
userRoute.get("/roles/all", UserController.getAllRoles);

export default userRoute;
