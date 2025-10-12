import { AppDataSource } from "../app";
import { Pharmacy } from "../entities/Pharmacy.entity";
import { Repository } from "typeorm";

export function getPharmacyRepository(): Repository<Pharmacy> {
  return AppDataSource.getRepository(Pharmacy);
}
