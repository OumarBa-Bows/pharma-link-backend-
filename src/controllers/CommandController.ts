import { Request, Response } from "express";
import { ListingService } from "../services/listing/ListingService";
import { logger } from "../app";
import { validationResult } from "express-validator";
import { AppDataSource } from "../configs/data-source";
import { CommandService } from "../services/commandes/CommandService";
export class CommandController {
  static create = async (req: Request, res: Response) => {
    logger.info("Start Creation Command");

    // Start the querry runner insatance
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const commandes = await CommandService.createCommand(
        queryRunner,
        req.body
      );
      await queryRunner.commitTransaction();
      return res.status(200).send({
        success: true,
        message: "Command  created successfully",
        data: { commandes },
      });
    } catch (error: any) {
      console.error("CreateCommandError", error);
      queryRunner.rollbackTransaction();
      return res.status(500).send({
        success: false,
        message: error.message || "Error creating listing",
      });
    } finally {
      await queryRunner.release();
    }
  };

  static getById = async (req: Request, res: Response) => {
    try {
      const command = await CommandService.getCommandById(req.body);
      return res.status(200).send({
        success: true,
        message: "Command retrieved successfully",
        data: { command },
      });
    } catch (error: any) {
      console.error("Error getting Command: ", error);
      return res.status(500).send({
        success: false,
        message: error.message || "Error getting Command",
      });
    }
  };

  static update = async (req: Request, res: Response) => {
    logger.info("Start update Command");

    // Start the querry runner insatance
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const commandes = await CommandService.updateCommand(
        queryRunner,
        req.body
      );
      await queryRunner.commitTransaction();
      return res.status(200).send({
        success: true,
        message: "Command  updated successfully",
        data: { commandes },
      });
    } catch (error: any) {
      console.error("updateCommandError", error);
      queryRunner.rollbackTransaction();
      return res.status(500).send({
        success: false,
        message: error.message || "Error update update",
      });
    } finally {
      await queryRunner.release();
    }
  };

  static updateStatus = async (req: Request, res: Response) => {
    logger.info("Start update status Command");

    // Start the querry runner insatance
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const commandes = await CommandService.updateCommandStatus(
        queryRunner,
        req.body
      );
      await queryRunner.commitTransaction();
      return res.status(200).send({
        success: true,
        message: "Command  updated  successfuly successfully",
        data: { commandes },
      });
    } catch (error: any) {
      console.error("updateCommandStatusError", error);
      queryRunner.rollbackTransaction();
      return res.status(500).send({
        success: false,
        message: error.message || "Error update status",
      });
    } finally {
      await queryRunner.release();
    }
  };

  static getAllByDistributor = async (req: Request, res: Response) => {
    try {
      const commandes = await CommandService.getAllCommands();

      return res.status(200).send({
        success: true,
        message: "Command  updated  successfuly successfully",
        data: { commandes },
      });
    } catch (error: any) {
      return res.status(500).send({
        success: false,
        message: error.message || "Error update status",
      });
    }
  };

  static updateCommandeArticleQuantity = async (
    req: Request,
    res: Response
  ) => {
    logger.info("Start update article quantity in command");

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { commandId, articleId, quantity } = req.body;

      if (!commandId || !articleId || quantity === undefined) {
        return res.status(400).send({
          success: false,
          message: "commandId, articleId et quantity sont requis",
        });
      }

      const result = await CommandService.updateArticleQuantity(queryRunner, {
        commandId,
        articleId,
        quantity,
      });

      await queryRunner.commitTransaction();
      return res.status(200).send({
        success: true,
        message: "Quantité de l'article mise à jour avec succès",
        data: { result },
      });
    } catch (error: any) {
      console.error("Error updating commande article quantity: ", error);
      await queryRunner.rollbackTransaction();
      return res.status(500).send({
        success: false,
        message:
          error.message || "Erreur lors de la mise à jour de la quantité",
      });
    } finally {
      await queryRunner.release();
    }
  };

  static removeArticleFromCommande = async (req: Request, res: Response) => {
    logger.info("Start remove article from command");
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { commandId, articleId } = req.body;
      if (!commandId || !articleId) {
        return res.status(400).send({
          success: false,
          message: "commandId et articleId sont requis",
        });
      }
      const result = await CommandService.removeArticleFromCommand(
        queryRunner,
        { commandId, articleId }
      );

      await queryRunner.commitTransaction();
      return res.status(200).send({
        success: true,
        message: "Article supprimé de la commande avec succès",
        data: { result },
      });
    } catch (error: any) {
      console.error("Error removing article from commande: ", error);
      await queryRunner.rollbackTransaction();
      return res.status(500).send({
        success: false,
        message: error.message || "Erreur lors de la suppression de l'article",
      });
    } finally {
      await queryRunner.release();
    }
  };
}
