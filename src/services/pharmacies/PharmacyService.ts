import { Like } from 'typeorm';
import { logger } from '../../app';
import { Pharmacy } from '../../entities/Pharmacy.entity';
import { getPharmacyRepository } from '../../repository/pharmacyRepository';

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
        where: [
          { name: Like(`%${search}%`) },
          { address: Like(`%${search}%`) },
          { city: Like(`%${search}%`) },
        ],
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

  // Get pharmacy by ID
  static async getPharmacyById(id: string): Promise<Pharmacy | null> {
    try {
      const repository = this.getPharmacyRepository();
      return await repository.findOneBy({ id });
    } catch (error) {
      logger.error(`Error getting pharmacy with id ${id}: `, error);
      return Promise.reject(error);
    }
  }

  // Create a new pharmacy
  static async createPharmacy(pharmacyData: Partial<Pharmacy>): Promise<Pharmacy> {
    try {
      const repository = this.getPharmacyRepository();
      const pharmacy = repository.create(pharmacyData);
      return await repository.save(pharmacy);
    } catch (error) {
      logger.error('Error creating pharmacy: ', error);
      return Promise.reject(error);
    }
  }

  // Update an existing pharmacy
  static async updatePharmacy(
    id: string,
    updateData: Partial<Pharmacy>
  ): Promise<Pharmacy | null> {
    try {
      const repository = this.getPharmacyRepository();
      await repository.update(id, updateData);
      return await repository.findOneBy({ id });
    } catch (error) {
      logger.error(`Error updating pharmacy with id ${id}: `, error);
      return Promise.reject(error);
    }
  }

  // Delete a pharmacy
  static async deletePharmacy(id: string): Promise<boolean> {
    try {
      const repository = this.getPharmacyRepository();
      const result = await repository.delete(id);
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      logger.error(`Error deleting pharmacy with id ${id}: `, error);
      return Promise.reject(error);
    }
  }
}
