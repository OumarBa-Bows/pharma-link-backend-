import { Router } from "express";
import { PharmacyController } from "../controllers/PharmacyController";

const router = Router();

// Get all pharmacies
router.get("/", PharmacyController.getAllPharmacies);

// Get a single pharmacy by ID
router.get("/:id", PharmacyController.getPharmacyById);

// Create a new pharmacy
router.post("/", PharmacyController.create);

// Get paginated list of pharmacies
router.get("/", PharmacyController.getPaginated);

// Update a pharmacy
router.put("/:id", PharmacyController.update);

// Delete a pharmacy
router.delete("/:id", PharmacyController.delete);

export default router;
