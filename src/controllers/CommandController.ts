import { Request, Response } from "express";
import { ListingService } from "../services/listing/ListingService";
import { logger } from "../app";
import { validationResult } from "express-validator";
import { AppDataSource } from "../configs/data-source";
import { CommandService } from "../services/commandes/CommandService";
export class CommandController {


  static create = async (req: Request, res: Response) => {

    logger.info("Start Creation Command")
     
    // Start the querry runner insatance
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const commandes = await CommandService.createCommand(queryRunner,req.body);
      await queryRunner.commitTransaction()
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
    }finally{
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

    logger.info("Start update Command")
     
    // Start the querry runner insatance
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const commandes = await CommandService.updateCommand(queryRunner,req.body);
      await queryRunner.commitTransaction()
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
    }finally{
      await queryRunner.release();
    }
  };

  static updateStatus = async (req: Request, res: Response) => {

    logger.info("Start update status Command")
     
    // Start the querry runner insatance
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const commandes = await CommandService.updateCommandStatus(queryRunner,req.body);
      await queryRunner.commitTransaction()
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
    }finally{
      await queryRunner.release();
    }
  };


 
}
