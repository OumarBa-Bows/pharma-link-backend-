import { Request, Response } from "express";
import { PharmacyService } from "../services/pharmacies/PharmacyService";

export class PharmacyController {
    static async getAllPharmacies(req: Request, res: Response) {
        try {
            const pharmacies = await PharmacyService.getAllPharmacies();
            return res.status(200).send({
                success: true,
                message: "Pharmacies retrieved successfully",
                data: { pharmacies },
            });
        } catch (error:any) {
            console.error("Error getting pharmacies: ", error);
            return res.status(500).send({
                success: false,
                message: error.message || "Error getting pharmacies",
            });
        }
    }

    static async getPharmacyById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const pharmacy = await PharmacyService.getPharmacyById(id);
            return res.status(200).send({
                success: true,
                message: "Pharmacy retrieved successfully",
                data: { pharmacy },
            });
        } catch (error:any) {
            console.error("Error getting pharmacy: ", error);
            return res.status(500).send({
                success: false,
                message: error.message || "Error getting pharmacy",
            });
        }
    }
}