import { Request, Response } from "express";
import { ArticleService } from "../services/articles/ArticleService";

export class ArticleController {
  // Créer un article
  static create = async (req: Request, res: Response) => {
    try {
      const image = req.files?.image;
      const article = await ArticleService.createArticle(req.body, image);
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
      const image = req.files?.image;
      const article = await ArticleService.updateArticle(id, req.body, image);
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
      const article = await ArticleService.deleteArticle(id);
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

  // Récupérer les articles paginés
  static getPerPage = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await ArticleService.getArticlesPaginated(page, limit);
      return res.status(200).send({
        success: true,
        message: "Articles retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Error getting paginated articles: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error getting paginated articles",
      });
    }
  };

  // Récupérer un article par ID
  static getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const article = await ArticleService.getArticleById(id);
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

  // Importer des articles via un fichier Excel
  static upload = async (req: Request, res: Response) => {
    try {
      const file = (req as any).files?.file;
      if (!file) {
        return res.status(400).send({
          success: false,
          message: "Le fichier Excel est requis (champ 'file').",
        });
      }

      const result = await ArticleService.importArticlesFromExcel(file);
      const { created, updated, errors, items } = result;

      if (created + updated === 0 && errors.length > 0) {
        return res.status(400).send({
          success: false,
          message: "Aucun article importé. Des erreurs sont survenues.",
          data: { created, updated, errors, items },
        });
      }

      if (errors.length > 0) {
        return res.status(207).send({
          success: true,
          partial: true,
          message: "Import partiel: certains enregistrements ont échoué.",
          data: { created, updated, errors, items },
        });
      }

      return res.status(200).send({
        success: true,
        message: "Import terminé avec succès",
        data: { created, updated, errors, items },
      });
    } catch (error: any) {
      console.error("Error importing articles: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error importing articles",
      });
    }
  };

  static getCategories = async (req: Request, res: Response) => {
    try {
      const categories = await ArticleService.getCategories();
      return res.status(200).send({
        success: true,
        message: "Categories retrieved successfully",
        data: { categories },
      });
    } catch (error: any) {
      console.error("Error getting categories: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error getting categories",
      });
    }
  };

  static togglePublishStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const article = await ArticleService.togglePublishStatus(id);
      return res.status(200).send({
        success: true,
        message: "Article publish status toggled successfully",
        data: { article },
      });
    } catch (error: any) {
      console.error("Error toggling publish status: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error toggling publish status",
      });
    }
  };

  static addRemiseToArticle = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const remiseData = req.body;
      const article = await ArticleService.addRemiseToArticle(id, remiseData);
      return res.status(200).send({
        success: true,
        message: "Remise added to article successfully",
        data: { article },
      });
    } catch (error: any) {
      console.error("Error adding remise to article: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error adding remise to article",
      });
    }
  };

  static removeRemiseFromArticle = async (req: Request, res: Response) => {
    try {
      const { id, remiseId } = req.params;
      const article = await ArticleService.deleteRemiseFromArticle(
        id,
        remiseId
      );
      return res.status(200).send({
        success: true,
        message: "Remise removed from article successfully",
        data: { article },
      });
    } catch (error: any) {
      console.error("Error removing remise from article: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error removing remise from article",
      });
    }
  };

  static updateRemiseInArticle = async (req: Request, res: Response) => {
    try {
      const { id, remiseId } = req.params;
      const remiseData = req.body;
      const article = await ArticleService.updateRemiseOfArticle(
        id,
        remiseId,
        remiseData
      );
      return res.status(200).send({
        success: true,
        message: "Remise updated in article successfully",
        data: { article },
      });
    } catch (error: any) {
      console.error("Error updating remise in article: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error updating remise in article",
      });
    }
  };

  static getArticleRemises = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await ArticleService.getArticleRemises(id);
      return res.status(200).send({
        success: true,
        message: "Article remises retrieved successfully",
        data: { remises: result.remises, articleName: result.articleName },
      });
    } catch (error: any) {
      console.error("Error getting article remises: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error getting article remises",
      });
    }
  };
}
