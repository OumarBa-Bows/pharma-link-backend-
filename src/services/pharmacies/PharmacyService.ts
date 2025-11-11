import { getPharmacyRepository } from "../../repository/pharmacyRepository";
import { logger } from "../../app";
import { PharmacyDto } from "../../interfaces/PharmacyDto";

export class PharmacyService {
    static async getAllPharmacies() {
        try {
            const pharmacyRepo = getPharmacyRepository();
            const pharmacies = await pharmacyRepo.find({
                relations: ["customer", "zone"],
            });
            return pharmacies;
        } catch (error) {
            logger.error(error);
            return Promise.reject(error);
        }
    }
    static async getPharmacyById(id: string) {
        try {
            const pharmacyRepo = getPharmacyRepository();
            const pharmacy = await pharmacyRepo.findOne({
                where: { id },
                relations: ["customer", "zone"],
            });
            return pharmacy;
        } catch (error) {
            logger.error(error);
            return Promise.reject(error);
        }
    }
    static async createPharmacy(pharmacy: PharmacyDto) {
        try {
            const pharmacyRepo = getPharmacyRepository();
            const newPharmacy = await pharmacyRepo.save(pharmacy);
            return newPharmacy;
        } catch (error) {
            logger.error(error);
            return Promise.reject(error);
        }
    }

    static async updatePharmacy(id: string, pharmacy: PharmacyDto) {
        try {
            const pharmacyRepo = getPharmacyRepository();
            const updatedPharmacy = await pharmacyRepo.update(id, pharmacy);
            return updatedPharmacy;
        } catch (error) {
            logger.error(error);
            return Promise.reject(error);
        }
    }

    static async deletePharmacy(id: string) {
        try {
            const pharmacyRepo = getPharmacyRepository();
            const deletedPharmacy = await pharmacyRepo.delete(id);
            return deletedPharmacy;
        } catch (error) {
            logger.error(error);
            return Promise.reject(error);
        }
    }
}
