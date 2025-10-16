import { logger } from "../../app";
import { ArticleDto } from "../../interfaces/ArticleDto";
import { getArticleRepository } from "../../repository/articleRepository";
import { supabase } from "../../app";

export class ArticleService {
  // Créer un article
  static async createArticle(data: ArticleDto, image: any) {
    try {
      logger.info("Creating article with data:", data);
      // Nom unique pour éviter les conflits
      const imageLink = await this.uploadImage(image);
      data.imageLink = imageLink;
      const articleRepo = getArticleRepository();
      const article = articleRepo.create(data);
      await articleRepo.save(article);
      return article;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Mettre à jour un article
  static async updateArticle(id: string, data: ArticleDto) {
    try {
      const articleRepo = getArticleRepository();
      const articleData = {
        ...data,
        ...(data.price !== undefined && {
          price:
            typeof data.price === "string"
              ? parseFloat(data.price)
              : data.price,
        }),
      };
      const article = await articleRepo.update({ id }, articleData);
      return article;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Supprimer un article
  static async deleteArticle(id: string) {
    try {
      const articleRepo = getArticleRepository();
      const article = await articleRepo.delete({ id });
      return article;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Récupérer tous les articles
  static async getAllArticles() {
    try {
      const articleRepo = getArticleRepository();
      return await articleRepo.find();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Récupérer un article par ID
  static async getArticleById(id: string) {
    try {
      const articleRepo = getArticleRepository();
      return await articleRepo.findOneBy({ id });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
 * Upload une image vers Supabase Storage et retourne l'URL publique.
 *
 * @param file - Fichier provenant de req.files.image
 * @param bucketName - Nom du bucket Supabase (ex: "article-images")
 * @param folder - Dossier dans le bucket (ex: "articles/")
 * @returns L'URL publique du fichier uploadé
 */
 static async uploadImage(file: any, bucketName = "articles-images", folder = "images/"): Promise<string> {
  try {
    if (!file) {
      return "";
    }

    // Nom unique pour éviter les collisions
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${folder}${fileName}`;

    // Upload dans Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.data, {
        contentType: file.mimetype,
        upsert: false, // ne remplace pas si le fichier existe déjà
      });

    if (uploadError) throw uploadError;

    // Récupérer l’URL publique
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("Impossible de récupérer l'URL publique du fichier");
    }

    return data.publicUrl;
  } catch (error: any) {
    console.error("Erreur lors de l'upload Supabase:", error.message);
    throw new Error("Échec de l'upload de l'image: " + error.message);
  }
 }
}
