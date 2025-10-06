import { Request, Response } from "express";
import { UserService } from "../services/users/UserService";

export class UserController {
  static create = async (req: Request, res: Response) => {
    try {
      const user = await UserService.createUser(req.body);
      return res.status(200).send({
        success: true,
        message: "User created successfully",
        data: { user },
      });
    } catch (error: any) {
      console.error("Error creating user: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error creating user",
      });
    }
  };

  static update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = Number(id);

      const user = await UserService.updateUser(userId, req.body);
      return res.status(200).send({
        success: true,
        message: "User updated successfully",
        data: { user },
      });
    } catch (error: any) {
      console.error("Error updating user: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error updating user",
      });
    }
  };

  static delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = Number(id);
      const user = await UserService.deleteUser(userId);
      return res.status(200).send({
        success: true,
        message: "User deleted successfully",
        data: { user },
      });
    } catch (error: any) {
      console.error("Error deleting user: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error deleting user",
      });
    }
  };

  static getAll = async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const data = await UserService.getAllUsers(page, limit);
      return res.status(200).send({
        success: true,
        message: "Users fetched successfully",
        data,
      });
    } catch (error: any) {
      console.error("Error getting users: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error getting users",
      });
    }
  };

  static getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = Number(id);
      const user = await UserService.getUserById(userId);
      return res.status(200).send({
        success: true,
        message: "User fetched successfully",
        data: { user },
      });
    } catch (error: any) {
      console.error("Error getting users: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error getting users",
      });
    }
  };

  static getAllRoles = async (req: Request, res: Response) => {
    try {
      const data = await UserService.getAllRoles();
      return res.status(200).send({
        success: true,
        message: "Roles fetched successfully",
        data,
      });
    } catch (error: any) {
      console.error("Error getting roles: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error getting roles",
      });
    }
  };
}
