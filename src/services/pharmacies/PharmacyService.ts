import { Like, FindOptionsWhere, QueryRunner } from "typeorm";
import { getPharmacyRepository, getPharmacyRepositoryWithQueryRunner } from "../../repository/pharmacyRepository";
import { getCommandRepository } from "../../repository/commandRepository";
import { logger } from "../../app";
import { Pharmacy } from "../../entities/Pharmacy.entity";
import { PharmacyState } from "../../enums/PharmacyState.enum";
import { COMMAND_STATUS } from "../../enums/CommandStatus";
import { supabase } from "../../app";
import { AuthService } from "../auth/AuthService";


const authService = new AuthService();
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommandCountByStatus {
  total: number;
  validated: number;
  pending: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export class PharmacyService {
  // Get paginated list of pharmacies with search
  static async getPaginatedPharmacies(
    page: number = 1,
    limit: number = 10,
    search: string = "",
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
          "PhoneNumberAlreadyExists: Une pharmacie avec ce numéro de téléphone existe déjà.",
        );
      }

      // Vérifier si une pharmacie avec le même code existe déjà
      const existingCode = await pharmacyRepo.findOne({
        where: { code: data.code },
      });

      if (existingCode) {
        throw new Error(
          "CodeAlreadyExists: Une pharmacie avec ce code existe déjà.",
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
          }`,
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

  // Update pharmacy user password
  static async updatePharmacyPassword(
    id: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const pharmacyRepo = getPharmacyRepository();
      const pharmacy = await pharmacyRepo.findOne({ where: { id } });

      if (!pharmacy) {
        throw new Error("PharmacyNotFound: Pharmacie introuvable.");
      }

      if (!pharmacy.userId) {
        throw new Error(
          "NoUserLinked: Aucun utilisateur lié à cette pharmacie.",
        );
      }

      const { error } = await supabase.auth.admin.updateUserById(
        pharmacy.userId as string,
        { password: newPassword },
      );

      if (error) {
        throw new Error(
          `Erreur lors de la mise à jour du mot de passe: ${error.message}`,
        );
      }
    } catch (error) {
      logger.error("Error in updatePharmacyPassword: ", error);
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
    queryRunner: QueryRunner,
    id: string,
    pharmacyData: Partial<Pharmacy>,
  ): Promise<Pharmacy | null> {
    try {
      console.log("Updating pharmacy with ID:", id, "and data:", pharmacyData);
      const repository = getPharmacyRepositoryWithQueryRunner(queryRunner);
      const existingPharmacy = await repository.findOne({ where: { id } });

      if (!existingPharmacy) {
        throw new Error("PharmacyNotFound: Pharmacie introuvable.");
      }
      await repository.update(id, pharmacyData);
      
      await authService.update(queryRunner, {
        phone: pharmacyData.phone!,
        userId: existingPharmacy.userId as string,
      });

      return await this.getPharmacyById(id);
    } catch (error) {
      logger.error("Error in updatePharmacy: ", error);
      return Promise.reject(error);
    }
  }

  // Update pharmacy state
  static async updatePharmacyState(
    id: string,
    state: PharmacyState,
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

  // Get the number of commands for a pharmacy
  static async getPharmacyCommandCount(
    pharmacyId: string,
  ): Promise<CommandCountByStatus> {
    try {
      const commandRepository = getCommandRepository();

      // Get total count
      const total = await commandRepository.count({
        where: { pharmacyId },
      });

      // Get count for each status
      const validated = await commandRepository.count({
        where: { pharmacyId, status: COMMAND_STATUS.validated },
      });

      const pending = await commandRepository.count({
        where: { pharmacyId, status: COMMAND_STATUS.pending },
      });

      const shipped = await commandRepository.count({
        where: { pharmacyId, status: COMMAND_STATUS.shipped },
      });

      const delivered = await commandRepository.count({
        where: { pharmacyId, status: COMMAND_STATUS.delivered },
      });

      const cancelled = await commandRepository.count({
        where: { pharmacyId, status: COMMAND_STATUS.cancelled },
      });

      return {
        total,
        validated,
        pending,
        shipped,
        delivered,
        cancelled,
      };
    } catch (error) {
      logger.error("Error in getPharmacyCommandCount: ", error);
      return Promise.reject(error);
    }
  }
}
