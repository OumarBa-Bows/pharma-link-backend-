import { Like, FindOptionsWhere } from 'typeorm';
import { getPharmacyRepository } from "../../repository/pharmacyRepository";
import { logger } from "../../app";
import { PharmacyDto } from "../../interfaces/PharmacyDto";
import { Pharmacy } from '../../entities/Pharmacy.entity';
import { PharmacyState } from '../../enums/PharmacyState.enum';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PharmacyService {
  private static getPharmacyRepository() {
    return getPharmacyRepository();
  }

  // Get paginated list of pharmacies with search
  static async getPaginatedPharmacies(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<PaginatedResult<Pharmacy>> {
    try {
      const repository = this.getPharmacyRepository();
      const [data, total] = await repository.findAndCount({
        where: search ? [
          { name: Like(`%${search}%`) },
          { address: Like(`%${search}%`) },
          { code: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
        ] : {},
        relations: ['zone', 'user'],
        order: { name: 'ASC' },
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
      logger.error('Error in getPaginatedPharmacies: ', error);
      return Promise.reject(error);
    }
  }
   static async getAllPharmacies() {
        try {
            const pharmacyRepo = getPharmacyRepository();
            const pharmacies = await pharmacyRepo.find({
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


    // static async createPharmacy(pharmacy: PharmacyDto) {
    //     try {
    //         const pharmacyRepo = getPharmacyRepository();
    //         const newPharmacy = await pharmacyRepo.save(pharmacy);
    //         return newPharmacy;
    //     } catch (error) {
    //         logger.error(error);
    //         return Promise.reject(error);
    //     }
    // }
    
    
       

    
    // Create a new pharmacy
  static async createPharmacy(pharmacyData: Partial<Pharmacy>): Promise<Pharmacy> {
    try {
      const repository = this.getPharmacyRepository();
      // Set default state if not provided
      if (!pharmacyData.state) {
        pharmacyData.state = PharmacyState.PENDING;
      }
      const pharmacy = repository.create(pharmacyData);
      return await repository.save(pharmacy);
    } catch (error) {
      logger.error('Error in createPharmacy: ', error);
      return Promise.reject(error);
    }
  }
  
  //  static async createPharmacy(pharmacy: PharmacyDto) {
  //       try {
  //           const pharmacyRepo = getPharmacyRepository();
  //           const newPharmacy = await pharmacyRepo.save(pharmacy);
  //           return newPharmacy;
  //       } catch (error) {
  //           logger.error(error);
  //           return Promise.reject(error);
  //       }
  //   }

    // static async updatePharmacy(id: string, pharmacy: PharmacyDto) {
    //     try {
    //         const pharmacyRepo = getPharmacyRepository();
    //         const updatedPharmacy = await pharmacyRepo.update(id, pharmacy);
    //         return updatedPharmacy;
    //     } catch (error) {
    //         logger.error(error);
    //         return Promise.reject(error);
    //     }
    // }

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
      const repository = this.getPharmacyRepository();
      // Don't allow updating the state directly through this method
      // if (pharmacyData.state) {
      //   delete pharmacyData.state;
      // }
      
      await repository.update(id, pharmacyData);
      return await this.getPharmacyById(id);
    } catch (error) {
      logger.error('Error in updatePharmacy: ', error);
      return Promise.reject(error);
    }
  }
  
  // Update pharmacy state
  static async updatePharmacyState(
    id: string,
    state: PharmacyState
  ): Promise<Pharmacy | null> {
    try {
      const repository = this.getPharmacyRepository();
      await repository.update(id, { state });
      return await this.getPharmacyById(id);
    } catch (error) {
      logger.error('Error in updatePharmacyState: ', error);
      return Promise.reject(error);
    }
  }

  // Delete a pharmacy
  // static async deletePharmacy(id: string): Promise<boolean> {
  //   try {
  //     const repository = this.getPharmacyRepository();
  //     const result = await repository.delete(id);
  //     return result.affected ? result.affected > 0 : false;
  //   } catch (error) {
  //     logger.error(`Error deleting pharmacy with id ${id}: `, error);
  //     return Promise.reject(error);
  //   }
  // }
}
