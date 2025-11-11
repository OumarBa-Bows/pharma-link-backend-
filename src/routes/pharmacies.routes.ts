import { Router } from "express";
import { PharmacyController } from "../controllers/PharmacyController";

const pharmacyRoute = Router();

pharmacyRoute.get("/", PharmacyController.getAllPharmacies);
pharmacyRoute.get("/:id", PharmacyController.getPharmacyById);

export default pharmacyRoute;
