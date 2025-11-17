import { Router } from "express";
import { AuthPharmacyController } from "../../controllers/pharmacy/auth.pharmacy.controller";
import {
  loginValidator,
  registerValidator,
} from "../../middlewares/pharmacy/auth.pharmacy.middleware";

const router = Router();

// Connexion
router.post("/login", loginValidator, AuthPharmacyController.login);

// Inscription
router.post(
  "/register",
  registerValidator,
  AuthPharmacyController.createPharmacyCustomer
);

export default router;
