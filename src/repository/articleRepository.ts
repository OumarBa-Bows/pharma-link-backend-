import { AppDataSource } from "../app";
import { Article } from "../entities/Article.entity";
import { Repository } from "typeorm";

export function getArticleRepository(): Repository<Article> {
  return AppDataSource.getRepository(Article);
}
