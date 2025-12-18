import { In } from "typeorm";
import { ListingDetail } from "../../entities/ListingDetail.entity";
import { getArticleRepository } from "../../repository/articleRepository";
import { getListingRepository } from "../../repository/listingRepository";
import * as XLSX from "xlsx";

const listingRepository = getListingRepository();
const articleRepository = getArticleRepository();

interface CreateListingDTO {
  name: string;
  description?: string;
  end_date?: Date;
  articleIds: Array<string>;
}

interface UpdateListingDTO {
  name?: string;
  description?: string;
  end_date?: Date;
  articleIds?: Array<string>;
}

export class ListingService {
  static async createListing(data: CreateListingDTO) {
    try {
      const { name, description, end_date, articleIds } = data;
      const articleEntities = await articleRepository.findBy({
        id: In(articleIds),
      });

      if (articleEntities.length !== articleIds.length) {
        const foundIds = articleEntities.map((a) => a.id);
        const missing = articleIds.filter((id) => !foundIds.includes(id));
        throw new Error(`Articles non trouvés : ${missing.join(", ")}`);
      }

      const listingDetails = articleIds.map((a) => {
        const article = articleEntities.find((art) => art.id === a)!;
        const detail = new ListingDetail();
        detail.article = article;
        detail.articleId = article.id;
        detail.name = article.name;
        detail.status = "active";
        return detail;
      });

      // Mettre isPublished à true pour tous les articles du listing
      for (const article of articleEntities) {
        article.isPublished = true;
      }
      await articleRepository.save(articleEntities);

      const listing = listingRepository.create({
        name,
        description,
        end_date: end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        listingDetails,
      });

      const savedListing = await listingRepository.save(listing);

      return {
        id: savedListing.id,
        name: savedListing.name,
        description: savedListing.description,
        end_date: savedListing.end_date,
        createdAt: savedListing.createdAt,
        updatedAt: savedListing.updatedAt,
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static async getListings() {
    try {
      const listings = await listingRepository.find({
        order: { createdAt: "DESC" },
      });

      return listings.map((l) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        end_date: l.end_date,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      }));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static async getListingById(id: string) {
    try {
      const listing = await listingRepository.findOne({
        where: { id },
        relations: ["listingDetails", "listingDetails.article"],
      });

      if (!listing) {
        throw new Error("Listing introuvable");
      }

      return {
        id: listing.id,
        name: listing.name,
        description: listing.description,
        end_date: listing.end_date,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        listingDetails: listing.listingDetails.map((ld) => ({
          id: ld.id,
          status: ld.status,
          articleId: ld.article.id,
          articleName: ld.article.name,
          articleImage: ld.article.imageLink,
          articlePrice: ld.article.price,
        })),
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static async updateListing(id: string, data: UpdateListingDTO) {
    try {
      const listing = await listingRepository.findOne({
        where: { id },
        relations: ["listingDetails"],
      });

      if (!listing) throw new Error("Listing introuvable");

      // Mise à jour des champs simples
      listing.name = data.name ?? listing.name;
      listing.description = data.description ?? listing.description;
      listing.end_date = data.end_date ?? listing.end_date;

      // Mise à jour des articles (si fournis)
      if (data.articleIds && data.articleIds.length > 0) {
        const articleIds = data.articleIds.map((a) => a);
        const articleEntities = await articleRepository.findBy({
          id: In(articleIds),
        });

        if (articleEntities.length !== data.articleIds.length) {
          throw new Error("Un ou plusieurs articles n'existent pas");
        }

        // Supprime les anciens ListingDetails
        listing.listingDetails = [];

        // Crée les nouveaux
        listing.listingDetails = data.articleIds.map((a) => {
          const article = articleEntities.find((art) => art.id === a)!;
          const detail = new ListingDetail();
          detail.article = article;
          detail.articleId = article.id;
          detail.name = article.name;
          detail.status = "active";
          return detail;
        });
      }

      const updatedListing = await listingRepository.save(listing);

      return {
        id: updatedListing.id,
        name: updatedListing.name,
        description: updatedListing.description,
        end_date: updatedListing.end_date,
        createdAt: updatedListing.createdAt,
        updatedAt: updatedListing.updatedAt,
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static async deleteListing(id: string) {
    try {
      const listing = await listingRepository.findOne({ where: { id } });
      if (!listing) throw new Error("Listing introuvable");
      await listingRepository.remove(listing);
      return true;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Récupérer les articles d'un listing avec leurs détails
  static async showItems(listingId: string) {
    try {
      const listing = await listingRepository.findOne({
        where: { id: listingId },
        relations: ["listingDetails", "listingDetails.article"],
      });

      if (!listing) {
        throw new Error("Listing introuvable");
      }

      return listing.listingDetails.map((ld) => ({
        id: ld.article.id,
        name: ld.article.name,
        reference: ld.article.reference,
        price: ld.article.price,
        availableQuantity: ld.article.availableQuantity,
      }));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static async importListing(
    file: any,
    listingName?: string,
    listingDescription?: string,
    endDate?: Date
  ) {
    try {
      if (!file || !file.data) {
        throw new Error("Fichier invalide ou manquant");
      }

      const workbook = XLSX.read(file.data, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error("Aucune feuille trouvée dans le fichier Excel");
      }

      const worksheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

      if (!rows || rows.length === 0) {
        throw new Error("Aucune donnée trouvée dans le fichier Excel");
      }

      const rawReferences: string[] = rows.map((r) => {
        const keys = Object.keys(r || {});
        const key = keys.find((k) => {
          const kk = String(k).toLowerCase().trim();
          return kk === "reference" || kk === "ref" || kk === "référence";
        });
        const val = key ? r[key] : null;
        if (val === null || val === undefined) return "";
        if (typeof val === "number") return String(val);
        if (typeof val === "string") return val;
        return String(val);
      });

      const references = rawReferences
        .map((s) => String(s || "").trim())
        .filter((s) => s.length > 0);

      if (references.length === 0) {
        throw new Error("Aucune référence valide trouvée dans le fichier");
      }

      const uniqueRefs = Array.from(new Set(references));

      const articleEntities = await articleRepository.findBy({
        reference: In(uniqueRefs),
      });

      if (articleEntities.length !== uniqueRefs.length) {
        const found = articleEntities.map((a) => a.reference);
        const missing = uniqueRefs.filter((id) => !found.includes(id));
        throw new Error(`Article non trouvé reference: ${missing.join(", ")}`);
      }

      const byRef = new Map<string, (typeof articleEntities)[number]>(
        articleEntities.map((a) => [a.reference, a])
      );

      const listingDetails = references.map((ref) => {
        const article = byRef.get(ref)!;
        const detail = new ListingDetail();
        detail.article = article;
        detail.articleId = article.id;
        detail.name = article.name;
        detail.status = "active";
        return detail;
      });

      // Mettre isPublished à true pour tous les articles du listing
      for (const article of articleEntities) {
        article.isPublished = true;
      }
      await articleRepository.save(articleEntities);

      const listing = listingRepository.create({
        name: listingName ?? this.generateListingDescription(),
        description: listingDescription ?? this.generateListingDescription(),
        end_date: endDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        listingDetails,
      });

      const savedListing = await listingRepository.save(listing);

      return {
        id: savedListing.id,
        name: savedListing.name,
        description: savedListing.description,
        end_date: savedListing.end_date,
        createdAt: savedListing.createdAt,
        updatedAt: savedListing.updatedAt,
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static generateListingDescription(): string {
    const now = new Date();
    const formatted =
      "Liste des articles pour le " +
      now.getDate().toString().padStart(2, "0") +
      "/" +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      "/" +
      now.getFullYear() +
      " à " +
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");
    return formatted;
  }
}
