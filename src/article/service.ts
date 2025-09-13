// import { prisma } from "../configs/prisma.conf";

import { prisma } from "../configs/prisma.conf";


interface ArticleData {
  title?: string;
  description?: string;
  price?: number | string;
  [key: string]: any; // pour les autres champs dynamiques
}

export class ArticleService {
  // Créer un article
  static async createArticle(data: ArticleData) {
    try {
      console.log('Creating article with data:', data);

      const articleData = {
        ...data,
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
      };

      const article = await prisma.article.create({ data: articleData });
      return article;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Mettre à jour un article
  static async updateArticle(id: number, data: ArticleData) {
    try {
      const articleData = {
        ...data,
        ...(data.price !== undefined && {
          price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        }),
      };

      const article = await prisma.article.update({
        where: { id },
        data: articleData,
      });

      return article;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Supprimer un article
  static async deleteArticle(id: number) {
    try {
      const article = await prisma.article.delete({ where: { id } });
      return article;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Récupérer tous les articles
  static async getAllArticles() {
    try {
      const articles = await prisma.article.findMany();
      return articles;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Récupérer un article par ID
  static async getArticleById(id: number) {
    try {
      const article = await prisma.article.findUnique({ where: { id } });
      return article;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
