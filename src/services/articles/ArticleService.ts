import { logger } from "../../app";
import { ArticleDto } from "../../interfaces/ArticleDto";
import { getArticleRepository } from "../../repository/articleRepository";
import { supabase } from "../../app";
import * as XLSX from "xlsx";
import { getCategoryRepository } from "../../repository/categoryRepository";

export class ArticleService {
  // Créer un article
  static async createArticle(data: ArticleDto, image: any) {
    try {
      logger.info("Creating article with data:", data);
      // Upload d'image uniquement si fourni
      let imageLink = data.imageLink ?? "";
      if (image) {
        imageLink = await this.uploadImage(image);
      }
      const articleRepo = getArticleRepository();
      const articleData = {
        ...data,
        imageLink,
        ...(data.price !== undefined && {
          price:
            typeof (data as any).price === "string"
              ? parseFloat((data as any).price as any)
              : data.price,
        }),
      } as any;
      const article = articleRepo.create(articleData);
      await articleRepo.save(article);
      return article;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Mettre à jour un article
  static async updateArticle(id: string, data: ArticleDto, image: any) {
    try {
      const articleRepo = getArticleRepository();
      const existing = await this.getArticleById(id);
      if (!existing) {
        throw new Error("Article introuvable");
      }

      // Préserver l'image existante si aucune nouvelle image n'est fournie
      let imageLink = existing.imageLink ?? "";
      if (image) {
        const newImageLink = await this.uploadImage(image);
        if (existing.imageLink) {
          await this.deleteImage(existing.imageLink);
        }
        imageLink = newImageLink;
      }

      const articleData = {
        ...data,
        imageLink,
        ...(data.price !== undefined && {
          price:
            typeof data.price === "string"
              ? parseFloat(data.price)
              : data.price,
        }),
      } as any;
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
      const articleById = await this.getArticleById(id);
      if (articleById) {
        this.deleteImage(articleById.imageLink ?? "");
      }
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
      const articles = await articleRepo.find({
        relations: { category: true },
      });
      return articles.map((a: any) => ({
        ...a,
        category: a?.category?.name ?? null,
      }));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Récupérer les articles paginés
  static async getArticlesPaginated(page: number = 1, limit: number = 10) {
    try {
      const articleRepo = getArticleRepository();
      const [data, total] = await articleRepo.findAndCount({
        order: { createdAt: "DESC" },
        skip: (page - 1) * limit,
        take: limit,
        relations: { category: true },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: data.map((a: any) => ({
          ...a,
          category: a?.category?.name ?? null,
        })),
        total,
        page: +page,
        limit: +limit,
        totalPages,
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Récupérer un article par ID
  static async getArticleById(id: string) {
    try {
      const articleRepo = getArticleRepository();
      const article: any = await articleRepo.findOne({
        where: { id },
        relations: { category: true },
      });
      if (!article) return null;
      return {
        ...article,
        category: article?.category?.name ?? null,
      } as any;
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
  static async uploadImage(
    file: any,
    bucketName = "articles-images",
    folder = "images/"
  ): Promise<string> {
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

  /**
   * Supprime une image de Supabase Storage à partir de son URL publique.
   *
   * @param imageUrl - URL publique de l'image (retournée par `uploadImage`)
   * @param bucketName - Nom du bucket Supabase (ex: "articles-images")
   * @returns true si la suppression a réussi
   */
  static async deleteImage(
    imageUrl: string,
    bucketName = "articles-images"
  ): Promise<boolean> {
    try {
      if (!imageUrl) {
        return false;
      }

      // Extraire le chemin du fichier à partir de l'URL publique
      const marker = `/object/public/${bucketName}/`;
      const idx = imageUrl.indexOf(marker);
      if (idx === -1) {
        throw new Error(
          "URL invalide: impossible d'extraire le chemin du fichier"
        );
      }
      const filePath = imageUrl.substring(idx + marker.length);

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) throw error;

      return true;
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'image:", error.message);
      // throw new Error("Échec de la suppression de l'image: " + error.message);
      return false;
    }
  }

  /**
   * Importe des articles depuis un fichier Excel.
   * Les lignes doivent contenir les colonnes: reference, name, price, description, expiryDate, barcode, imageLink.
   * Les articles sont upsert par le champ unique `reference`.
   *
   * @param file - Fichier Excel (ex: req.files.file) dont le buffer est accessible via file.data
   * @returns { created, updated, errors, items }
   */
  static async importArticlesFromExcel(
    file: any
  ): Promise<{
    created: number;
    updated: number;
    errors: string[];
    items: any[];
  }> {
    try {
      if (!file || !file.data) {
        throw new Error("Fichier Excel manquant");
      }

      const workbook = XLSX.read(file.data, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error("Aucune feuille trouvée dans le fichier Excel");
      }

      const worksheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

      const articleRepo = getArticleRepository();
      let created = 0;
      let updated = 0;
      const errors: string[] = [];
      const items: any[] = [];

      const parseDate = (val: any): Date | undefined => {
        if (!val) return undefined;
        if (val instanceof Date) return val;
        if (typeof val === "number") {
          const d = XLSX.SSF?.parse_date_code?.(val);
          if (d) return new Date(d.y, d.m - 1, d.d);
        }
        const dt = new Date(val);
        return isNaN(dt.getTime()) ? undefined : dt;
      };

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const lineNo = i + 2; // header on line 1
        try {
          const reference = (r.reference ?? r.Reference ?? r.REFERENCE ?? "")
            .toString()
            .trim();
          const name = (r.name ?? r.Name ?? r.Nom ?? "").toString().trim();
          const priceRaw = r.price ?? r.Price ?? r.prix ?? r.Prix;
          const description = r.description ?? r.Description ?? undefined;
          const expiryRaw =
            r.expiryDate ??
            r.ExpiryDate ??
            r.expiry ??
            r.Expiry ??
            r.dateExp ??
            r.DateExp;
          const barcode =
            r.barcode ?? r.Barcode ?? r.codeBarre ?? r.CodeBarre ?? undefined;
          const imageLink =
            r.imageLink ?? r.ImageLink ?? r.image ?? r.Image ?? undefined;

          if (!reference) throw new Error("reference manquant");
          if (!name) throw new Error("name manquant");
          if (priceRaw === null || priceRaw === undefined || priceRaw === "") {
            throw new Error("price manquant");
          }

          let price: number;
          if (typeof priceRaw === "number") price = priceRaw;
          else
            price = parseFloat(
              (priceRaw as string).toString().replace(",", ".")
            );
          if (!isFinite(price)) throw new Error("price invalide");

          const expiryDate = parseDate(expiryRaw);

          const existing = await articleRepo.findOne({ where: { reference } });
          if (existing) {
            existing.name = name;
            existing.price = price;
            existing.description = description ?? existing.description;
            existing.expiryDate = expiryDate ?? existing.expiryDate;
            existing.barcode = barcode ?? existing.barcode;
            if (imageLink) existing.imageLink = imageLink;
            await articleRepo.save(existing);
            updated += 1;
            items.push({
              id: existing.id,
              reference: existing.reference,
              name: existing.name,
              price: existing.price,
              description: existing.description,
              expiryDate: existing.expiryDate,
              barcode: existing.barcode,
              imageLink: existing.imageLink,
            });
          } else {
            const createdEntity = articleRepo.create({
              reference,
              name,
              price,
              description,
              expiryDate,
              barcode,
              imageLink,
            });
            await articleRepo.save(createdEntity);
            created += 1;
            items.push({
              id: createdEntity.id,
              reference: createdEntity.reference,
              name: createdEntity.name,
              price: createdEntity.price,
              description: createdEntity.description,
              expiryDate: createdEntity.expiryDate,
              barcode: createdEntity.barcode,
              imageLink: createdEntity.imageLink,
            });
          }
        } catch (err: any) {
          errors.push(`Ligne ${lineNo}: ${err.message || err}`);
        }
      }

      return { created, updated, errors, items };
    } catch (error: any) {
      console.error("Erreur lors de l'import Excel:", error.message);
      throw new Error("Échec de l'import des articles: " + error.message);
    }
  }

  static async getCategories(){
    try {
      const categoryRepo = getCategoryRepository();
      const categories = await categoryRepo.find();
      return categories;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des catégories:", error.message);
      throw new Error("Échec de la récupération des catégories: " + error.message);
    }
  }
}
