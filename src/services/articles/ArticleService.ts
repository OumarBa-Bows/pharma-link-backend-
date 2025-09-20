import { AppDataSource, logger } from "../../app";
import { Article } from "../../entities/Article.entity";
import { ArticleData } from "../../interfaces/ArticleDto";

export class ArticleService {
  // Créer un article
  static async createArticle(data: ArticleData) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      logger.info("Creating article with data:", data);
      const articleRepo = queryRunner.manager.getRepository(Article);
      const article = await articleRepo.insert(data);
      await queryRunner.commitTransaction();
      return article;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return Promise.reject(error);
    } finally {
      await queryRunner.release();
    }
  }

  // Mettre à jour un article
  static async updateArticle(id: number, data: ArticleData) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const articleRepo = queryRunner.manager.getRepository(Article);
      const articleData = {
        ...data,
        ...(data.price !== undefined && {
          price:
            typeof data.price === "string"
              ? parseFloat(data.price)
              : data.price,
        }),
      };

      const article = await articleRepo.update({ id: id }, articleData);

      return article;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return Promise.reject(error);
    } finally {
      await queryRunner.release();
    }
  }

  // Supprimer un article
  static async deleteArticle(id: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const article = await queryRunner.manager
        .getRepository(Article)
        .delete({ id });
      await queryRunner.commitTransaction();
      return article;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return Promise.reject(error);
    } finally {
      await queryRunner.release();
    }
  }

  // Récupérer tous les articles
  static async getAllArticles() {
    try {
      const articles = await AppDataSource.manager
        .getRepository(Article)
        .find();
      return articles;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Récupérer un article par ID
  static async getArticleById(id: number) {
    try {
      const article = await AppDataSource.manager
        .getRepository(Article)
        .findOne({ where: { id } });
      return article;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
