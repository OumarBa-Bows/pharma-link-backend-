import { CategoriesService } from "../services/categories/CategoriesService";
import { Request, Response } from "express";

export class CategoryController {
  static getCategories = async (req: Request, res: Response) => {
    try {
      const categories = await CategoriesService.getCategories();
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

  static createCategory = async (req: Request, res: Response) => {
    try {
      const category = await CategoriesService.createCategory(req.body);
      return res.status(201).send({
        success: true,
        message: "Category created successfully",
        data: { category },
      });
    } catch (error: any) {
      console.error("Error creating category: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error creating category",
      });
    }
  };

  static updateCategory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const category = await CategoriesService.updateCategory(
        Number(id),
        req.body
      );
      return res.status(200).send({
        success: true,
        message: "Category updated successfully",
        data: { category },
      });
    } catch (error: any) {
      console.error("Error updating category: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error updating category",
      });
    }
  };
}
