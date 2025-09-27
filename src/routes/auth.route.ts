import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { loginValidator } from "../middlewares/auth.middleware";

const router = Router();

// Connexion
router.post("/login", loginValidator, AuthController.login);
// Déconnexion
router.post("/logout", AuthController.logout);

export default router;
