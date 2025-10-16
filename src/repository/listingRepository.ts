import { AppDataSource } from "../configs/data-source";
import { Listing } from "../entities/Listing.entity";
import { Repository } from "typeorm";

export function getListingRepository(): Repository<Listing> {
  return AppDataSource.getRepository(Listing);
}
