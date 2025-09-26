import { Request, Response } from "express";
import { ArticleService } from "../services/articles/ArticleService";

export class ArticleController {
  // Créer un article
  static create = async (req: Request, res: Response) => {
    try {
      const article = await ArticleService.createArticle(req.body);
      return res.status(200).send({
        success: true,
        message: "Article created successfully",
        data: { article },
      });
    } catch (error: any) {
      console.error("Error creating article: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error creating article",
      });
    }
  };

  // Mettre à jour un article
  static update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const article = await ArticleService.updateArticle(Number(id), req.body);
      return res.status(200).send({
        success: true,
        message: "Article updated successfully",
        data: { article },
      });
    } catch (error: any) {
      console.error("Error updating article: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error updating article",
      });
    }
  };

  // Supprimer un article
  static delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const article = await ArticleService.deleteArticle(Number(id));
      return res.status(200).send({
        success: true,
        message: "Article deleted successfully",
        data: { article },
      });
    } catch (error: any) {
      console.error("Error deleting article: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error deleting article",
      });
    }
  };

  // Récupérer tous les articles
  static getAll = async (req: Request, res: Response) => {
    try {
      const articles = await ArticleService.getAllArticles();
      return res.status(200).send({
        success: true,
        message: "Articles retrieved successfully",
        data: { articles },
      });
    } catch (error: any) {
      console.error("Error getting articles: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error getting articles",
      });
    }
  };

  // Récupérer un article par ID
  static getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const article = await ArticleService.getArticleById(Number(id));
      return res.status(200).send({
        success: true,
        message: "Article retrieved successfully",
        data: { article },
      });
    } catch (error: any) {
      console.error("Error getting article: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error getting article",
      });
    }
  };
}
