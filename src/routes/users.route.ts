import { Router } from "express";
import { UserController } from "../controllers/UserController";
import {
  createUserValidator,
  updateUserValidator,
  updateUserPasswordValidator,
  resetUserPasswordValidator
} from "../middlewares/user.middleware";
import { authorize } from "../middlewares/auth.middleware";

const userRoute = Router();
userRoute.post("/", authorize(["admin", "user"]), createUserValidator, UserController.create);
userRoute.post("/update/:id", authorize(["admin", "user"]), updateUserValidator, UserController.update);
userRoute.get("/", authorize(["admin", "user"]), UserController.getAll);
userRoute.get("/connected/user", authorize(["admin", "user"]), UserController.getConnectedUser);
userRoute.get("/:id", authorize(["admin", "user"]), UserController.getById);
userRoute.get("/delete/:id", authorize(["admin", "user"]), UserController.delete);
userRoute.get("/roles/all", authorize(["admin", "user"]), UserController.getAllRoles);
userRoute.get("/has-role/:id", authorize(["admin", "user"]), UserController.isHasRole);
userRoute.post(
  "/update/password/:id",
  authorize(["admin", "user"]),
  updateUserPasswordValidator,
  UserController.updatePassword
);

userRoute.post(
  "/reset/password",
  authorize([]),
  resetUserPasswordValidator,
  UserController.resetPassword
);

export default userRoute;
