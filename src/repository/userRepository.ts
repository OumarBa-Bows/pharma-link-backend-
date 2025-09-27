import { AppDataSource } from "../app";
import { User } from "../entities/User.entity";
import { Repository } from "typeorm";

export function getUserRepository(): Repository<User> {
  return AppDataSource.getRepository(User);
}
