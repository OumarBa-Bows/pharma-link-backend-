import { Like, FindOptionsWhere } from "typeorm";
import { getPharmacyRepository } from "../../repository/pharmacyRepository";
import { logger } from "../../app";
import { Pharmacy } from "../../entities/Pharmacy.entity";
import { PharmacyState } from "../../enums/PharmacyState.enum";
import { supabase } from "../../app";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PharmacyService {
  // Get paginated list of pharmacies with search
  static async getPaginatedPharmacies(
    page: number = 1,
    limit: number = 10,
    search: string = ""
  ): Promise<PaginatedResult<Pharmacy>> {
    try {
      const repository = getPharmacyRepository();
      const [data, total] = await repository.findAndCount({
        where: search
          ? [
              { name: Like(`%${search}%`) },
              { address: Like(`%${search}%`) },
              { code: Like(`%${search}%`) },
              { email: Like(`%${search}%`) },
            ]
          : {},
        relations: ["zone", "user"],
        order: { createdAt: "DESC" },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page: +page,
        limit: +limit,
        totalPages,
      };
    } catch (error) {
      logger.error("Error in getPaginatedPharmacies: ", error);
      return Promise.reject(error);
    }
  }

  static async getAllPharmacies() {
    try {
      const pharmacyRepo = getPharmacyRepository();
      const pharmacies = await pharmacyRepo.find({
        order: { createdAt: "DESC" },
        relations: ["zone"],
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
        relations: ["zone"],
      });
      return pharmacy;
    } catch (error) {
      logger.error(error);
      return Promise.reject(error);
    }
  }

  // Create a new pharmacy with user account
  static async createPharmacy(data: any) {
    const pharmacyRepo = getPharmacyRepository();

    try {
      // 1. Vérifier si une pharmacie avec le même téléphone existe déjà
      const existingPharmacy = await pharmacyRepo.findOne({
        where: { phone: data.phone },
      });

      if (existingPharmacy) {
        throw new Error(
          "PhoneNumberAlreadyExists: Une pharmacie avec ce numéro de téléphone existe déjà."
        );
      }

      // Vérifier si une pharmacie avec le même code existe déjà
      const existingCode = await pharmacyRepo.findOne({
        where: { code: data.code },
      });

      if (existingCode) {
        throw new Error(
          "CodeAlreadyExists: Une pharmacie avec ce code existe déjà."
        );
      }

      // 2. Créer d'abord l'enregistrement de la pharmacie

      const pharmacy = pharmacyRepo.create({
        name: data.name,
        address: data.address,
        city: data.city,
        zipCode: data.zipCode,
        phone: data.phone,
        email: data.email,
        code: data.code,
        managerName: data.managerName,
        managerPhone: data.managerPhone,
        doctorName: data.doctorName,
        doctorPhone: data.doctorPhone,
        customerType: data.customerType,
        state: data.state,
      });

      const savedPharmacy = await pharmacyRepo.save(pharmacy);

      // 3. Créer l'utilisateur d'authentification avec Supabase
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: `${data.phone}@pharmalink.com`,
          password: data.password,
          email_confirm: true,
          user_metadata: {
            pharmacy_id: savedPharmacy.id,
            pharmacy_name: savedPharmacy.name,
            phone: data.phone,
            role: "PHARMACY",
          },
        });

      if (authError || !authData.user) {
        // Rollback: supprimer la pharmacie si la création de l'utilisateur échoue
        await pharmacyRepo.delete(savedPharmacy.id);
        throw new Error(
          `Erreur d'authentification: ${
            authError?.message || "Aucun utilisateur créé"
          }`
        );
      }

      // 4. Mettre à jour la pharmacie avec l'userId
      savedPharmacy.userId = authData.user.id as any;
      await pharmacyRepo.save(savedPharmacy);

      return {
        pharmacy: savedPharmacy,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          createdAt: authData.user.created_at,
        },
      };
    } catch (error: any) {
      logger.error("Erreur lors de l'enregistrement de la pharmacie:", error);
      throw error;
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

  static async updatePharmacy(
    id: string,
    pharmacyData: Partial<Pharmacy>
  ): Promise<Pharmacy | null> {
    try {
      const repository = getPharmacyRepository();
      await repository.update(id, pharmacyData);
      return await this.getPharmacyById(id);
    } catch (error) {
      logger.error("Error in updatePharmacy: ", error);
      return Promise.reject(error);
    }
  }

  // Update pharmacy state
  static async updatePharmacyState(
    id: string,
    state: PharmacyState
  ): Promise<Pharmacy | null> {
    try {
      const repository = getPharmacyRepository();
      await repository.update(id, { state });
      return await this.getPharmacyById(id);
    } catch (error) {
      logger.error("Error in updatePharmacyState: ", error);
      return Promise.reject(error);
    }
  }
}
