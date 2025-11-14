import { Router } from "express";
import { PharmacyController } from "../controllers/PharmacyController";

const router = Router();

// Create a new pharmacy
router.post("/", PharmacyController.create);

// Get paginated list of pharmacies
router.get("/", PharmacyController.getPaginated);

// Get a single pharmacy by ID
router.get("/:id", PharmacyController.getById);

// Update a pharmacy
router.put("/:id", PharmacyController.update);

// Delete a pharmacy
router.delete("/:id", PharmacyController.delete);

export default router;
