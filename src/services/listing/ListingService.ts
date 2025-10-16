import { In } from "typeorm";
import { ListingDetail } from "../../entities/ListingDetail.entity";
import { getArticleRepository } from "../../repository/articleRepository";
import { getListingRepository } from "../../repository/listingRepository";

const listingRepository = getListingRepository();
const articleRepository = getArticleRepository();

interface CreateListingDTO {
  name: string;
  description?: string;
  date?: Date;
  articles: Array<{ articleId: string }>;
}

interface UpdateListingDTO {
  name?: string;
  description?: string;
  date?: Date;
  articles?: Array<{ articleId: string }>;
}

export class ListingService {
  static async createListing(data: CreateListingDTO) {
    try {
      const { name, description, date, articles } = data;
      const articleIds = articles.map((a) => a.articleId);
      const articleEntities = await articleRepository.findBy({
        id: In(articleIds),
      });

      if (articleEntities.length !== articles.length) {
        const foundIds = articleEntities.map((a) => a.id);
        const missing = articleIds.filter((id) => !foundIds.includes(id));
        throw new Error(`Articles non trouvés : ${missing.join(", ")}`);
      }

      const listingDetails = articles.map((a) => {
        const article = articleEntities.find((art) => art.id === a.articleId)!;
        const detail = new ListingDetail();
        detail.article = article;
        detail.articleId = article.id;
        detail.name = article.name;
        detail.status = "active";
        return detail;
      });

      const listing = listingRepository.create({
        name,
        description,
        date,
        listingDetails,
      });

      const savedListing = await listingRepository.save(listing);

      return {
        id: savedListing.id,
        name: savedListing.name,
        description: savedListing.description,
        date: savedListing.date,
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
        date: l.date,
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
        date: listing.date,
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
      listing.date = data.date ?? listing.date;

      // Mise à jour des articles (si fournis)
      if (data.articles && data.articles.length > 0) {
        const articleIds = data.articles.map((a) => a.articleId);
        const articleEntities = await articleRepository.findBy({
          id: In(articleIds),
        });

        if (articleEntities.length !== data.articles.length) {
          throw new Error("Un ou plusieurs articles n'existent pas");
        }

        // Supprime les anciens ListingDetails
        listing.listingDetails = [];

        // Crée les nouveaux
        listing.listingDetails = data.articles.map((a) => {
          const article = articleEntities.find(
            (art) => art.id === a.articleId
          )!;
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
        date: updatedListing.date,
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
}
