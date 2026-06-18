import { AppDataSource } from "../configs/data-source";
import { Pharmacy } from "../entities/Pharmacy.entity";
import { QueryRunner, Repository } from "typeorm";

export function getPharmacyRepository(): Repository<Pharmacy> {
  return AppDataSource.getRepository(Pharmacy);
}


export function getPharmacyRepositoryWithQueryRunner(queryRunner: QueryRunner): Repository<Pharmacy> {
  return queryRunner.manager.getRepository(Pharmacy);
}

