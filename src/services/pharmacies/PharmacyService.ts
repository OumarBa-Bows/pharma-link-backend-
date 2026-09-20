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
  pharmacies: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<string, number>;
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
  // Get paginated list of pharmacies with search: pending pharmacies first, then newest
  static async getPaginatedPharmacies(
    page: number = 1,
    limit: number = 20,
    search: string = "",
    state: string = "",
  ): Promise<PaginatedResult<Pharmacy>> {
    try {
      const repository = getPharmacyRepository();
      const term = search.trim();

      // Base query (search) shared by the list and the per-state counters
      const baseQuery = () => {
        const qb = repository
          .createQueryBuilder("pharmacy")
          .leftJoinAndSelect("pharmacy.zone", "zone");
        if (term) {
          // Escape LIKE wildcards typed by the user
          const escaped = term.replace(/[\\%_]/g, "\\$&");
          qb.andWhere(
            "(pharmacy.name ILIKE :search OR pharmacy.phone ILIKE :search OR pharmacy.address ILIKE :search OR pharmacy.code ILIKE :search OR pharmacy.email ILIKE :search OR pharmacy.city ILIKE :search OR CAST(pharmacy.customerType AS TEXT) ILIKE :search OR CAST(pharmacy.state AS TEXT) ILIKE :search)",
            { search: `%${escaped}%` },
          );
        }
        return qb;
      };

      const listQuery = baseQuery();
      if (state) {
        listQuery.andWhere("pharmacy.state = :state", { state });
      }
      // offset/limit are enough: the ManyToOne join does not duplicate rows
      listQuery
        .addSelect(
          "CASE WHEN pharmacy.state = :pending THEN 0 ELSE 1 END",
          "pending_first",
        )
        .setParameter("pending", PharmacyState.PENDING)
        .orderBy("pending_first", "ASC")
        .addOrderBy("pharmacy.createdAt", "DESC")
        .addOrderBy("pharmacy.id", "DESC")
        .offset((page - 1) * limit)
        .limit(limit);

      const [[pharmacies, total], rawCounts] = await Promise.all([
        listQuery.getManyAndCount(),
        baseQuery()
          .select("pharmacy.state", "state")
          .addSelect("COUNT(*)", "count")
          .groupBy("pharmacy.state")
          .getRawMany<{ state: PharmacyState; count: string }>(),
      ]);

      const statusCounts: Record<string, number> = { ALL: 0 };
      for (const s of Object.values(PharmacyState)) statusCounts[s] = 0;
      for (const row of rawCounts) {
        statusCounts[row.state] = Number(row.count);
        statusCounts.ALL += Number(row.count);
      }

      return {
        pharmacies,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        statusCounts,
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
          // Rôle racine du JWT : requis par authorize(["admin","PHARMACY","commande"])
          // pour créer des commandes. Sans lui, le JWT reste role:"authenticated"
          // et le backend renvoie 403 "Insufficient permissions". Aligne cette
          // fonction sur la création côté portail (pharmacy-services.ts).
          role: "PHARMACY",
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

  /**
   * S'assure que l'utilisateur d'authentification lié possède le rôle racine
   * "PHARMACY" dans son JWT (requis par authorize(["admin","PHARMACY","commande"])
   * pour créer des commandes). Si le rôle est absent ou différent, il est ajouté.
   * Best-effort : n'interrompt pas la mise à jour de la pharmacie en cas d'échec.
   */
  static async ensurePharmacyRole(userId?: string): Promise<void> {
    if (!userId) return;
    try {
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      if (error || !data?.user) {
        logger.warn(
          `ensurePharmacyRole: utilisateur ${userId} introuvable${
            error ? ` (${error.message})` : ""
          }`,
        );
        return;
      }

      if ((data.user as any).role !== "PHARMACY") {
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          { role: "PHARMACY" },
        );
        if (updateError) {
          logger.error(
            `ensurePharmacyRole: échec de l'ajout du rôle pour ${userId}: ${updateError.message}`,
          );
        } else {
          logger.info(`ensurePharmacyRole: rôle "PHARMACY" ajouté à ${userId}`);
        }
      }
    } catch (error) {
      logger.error("ensurePharmacyRole: erreur inattendue:", error);
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

      // Garantit que le compte d'auth lié possède bien le rôle "PHARMACY"
      // (corrige au passage les comptes créés avant l'ajout du rôle à la création).
      await this.ensurePharmacyRole(existingPharmacy.userId as string);

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
