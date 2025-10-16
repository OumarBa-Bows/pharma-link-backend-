import { AppDataSource } from "../configs/data-source";
import { Role } from "../entities/Role.entity";
import { Repository } from "typeorm";

export function getRoleRepository(): Repository<Role> {
  return AppDataSource.getRepository(Role);
}
