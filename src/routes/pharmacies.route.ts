import { Router } from "express";
import { PharmacyController } from "../controllers/PharmacyController";

const router = Router();

// Get all pharmacies
router.get("/", PharmacyController.getAllPharmacies);

// Get paginated list of pharmacies (must be declared before "/:id")
router.get("/paginated/limit", PharmacyController.getPaginated);

// Get a single pharmacy by ID
router.get("/:id", PharmacyController.getPharmacyById);

// Create a new pharmacy
router.post("/", PharmacyController.create);

// Update a pharmacy
router.put("/:id", PharmacyController.update);

// Delete a pharmacy
router.delete("/:id", PharmacyController.delete);

// Get command count by status for a pharmacy
router.get("/:id/command-count", PharmacyController.getCommandCountByStatus);

router.post("/:id/update-password", PharmacyController.updatePharmacyPassword);

export default router;
