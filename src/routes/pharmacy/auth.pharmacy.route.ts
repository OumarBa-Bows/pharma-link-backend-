import { Router } from "express";
import { AuthPharmacyController } from "../../controllers/pharmacy/auth.pharmacy.controller";
import { loginValidator } from "../../middlewares/auth.middleware";

const router = Router();

// Connexion
router.post("/login", loginValidator, AuthPharmacyController.login);
// Déconnexion
router.post("/logout", AuthPharmacyController.logout);

export default router;
