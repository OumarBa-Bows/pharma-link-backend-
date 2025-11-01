import { Router } from "express";
import { UserController } from "../controllers/UserController";

const userRoute = Router();
userRoute.post("/", UserController.create);
userRoute.post("/update/:id", UserController.update);
userRoute.get("/", UserController.getAll);
userRoute.get("/connected/user", UserController.getConnectedUser);
userRoute.get("/:id", UserController.getById);
userRoute.get("/delete/:id", UserController.delete);
userRoute.get("/roles/all", UserController.getAllRoles);
userRoute.get("/has-role/:id", UserController.isHasRole);

export default userRoute;
