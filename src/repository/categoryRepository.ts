import { AppDataSource } from "../configs/data-source";
import { Category } from "../entities/Category.entity";
import { Repository } from "typeorm";

export function getCategoryRepository(): Repository<Category> {
  return AppDataSource.getRepository(Category);
}
