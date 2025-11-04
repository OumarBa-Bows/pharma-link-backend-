import { Router } from "express";
import { UserController } from "../controllers/UserController";
import {
  createUserValidator,
  updateUserValidator,
  updateUserPasswordValidator,
} from "../middlewares/user.middleware";

const userRoute = Router();
userRoute.post("/", createUserValidator, UserController.create);
userRoute.post("/update/:id", updateUserValidator, UserController.update);
userRoute.get("/", UserController.getAll);
userRoute.get("/connected/user", UserController.getConnectedUser);
userRoute.get("/:id", UserController.getById);
userRoute.get("/delete/:id", UserController.delete);
userRoute.get("/roles/all", UserController.getAllRoles);
userRoute.get("/has-role/:id", UserController.isHasRole);
userRoute.post(
  "/update/password/:id",
  updateUserPasswordValidator,
  UserController.updatePassword
);

export default userRoute;
