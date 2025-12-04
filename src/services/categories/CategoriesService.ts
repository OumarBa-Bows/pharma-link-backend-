import { CategoryDto } from "../../interfaces/CategoryDto";
import { logger } from "../../app";
import { getCategoryRepository } from "../../repository/categoryRepository";

export class CategoriesService {
  static async getCategories() {
    try {
      const categoryRepo = getCategoryRepository();
      const categories = await categoryRepo.find({ order: { id: "DESC" } });
      return categories;
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des catégories:",
        error.message
      );
      throw new Error(
        "Échec de la récupération des catégories: " + error.message
      );
    }
  }

  static async createCategory(categoryData: CategoryDto) {
    try {
      const categoryRepo = getCategoryRepository();

      // Vérifier si une catégorie avec le même nom existe déjà
      const existing = await categoryRepo.findOne({
        where: { name: categoryData.name },
      });

      if (existing) {
        throw new Error("ExceptionNameExists");
      }

      const newCategory = categoryRepo.create({
        name: categoryData.name,
        nameAr: categoryData.nameAr,
      });
      const saved = await categoryRepo.save(newCategory);
      return saved;
    } catch (error: any) {
      logger.error(
        "Erreur lors de la création de la catégorie:",
        error.message
      );
      throw new Error("Échec de la création de la catégorie: " + error.message);
    }
  }

  static async updateCategory(id: number, categoryData: CategoryDto) {
    try {
      const categoryRepo = getCategoryRepository();
      const category = await categoryRepo.findOneBy({ id });
      if (!category) {
        throw new Error("Catégorie non trouvée");
      }

      // Vérifier si une autre catégorie avec le même nom existe déjà
      const existing = await categoryRepo.findOne({
        where: { name: categoryData.name },
      });
      if (existing && existing.id !== id) {
        throw new Error("ExceptionNameExists");
      }
      category.name = categoryData.name;
      category.nameAr = categoryData.nameAr;
      const updated = await categoryRepo.save(category);
      return updated;
    } catch (error: any) {
      logger.error(
        "Erreur lors de la mise à jour de la catégorie:",
        error.message
      );
      throw new Error(
        "Échec de la mise à jour de la catégorie: " + error.message
      );
    }
  }
}
