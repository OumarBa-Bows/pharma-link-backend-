import { In, Not, QueryRunner } from "typeorm";
import { CreateCommandDTO } from "../../interfaces/CommandDto";
import { Command } from "../../entities/Command.entity";
import { CommandDetails } from "../../entities/CommandDetails.entity";
import { ArticleService } from "../articles/ArticleService";
import { getCommandRepository } from "../../repository/commandRepository";
import { getCommandDetailsRepository } from "../../repository/commandDetailsRepository";
import { Article } from "../../entities/Article.entity";
import { COMMAND_STATUS } from "../../enums/CommandStatus";

const commandRepository = getCommandRepository();
const commandDetailsRepo = getCommandDetailsRepository();

export class CommandService {
  constructor() {}

  static async createCommand(queryRunner: QueryRunner, data: CreateCommandDTO) {
    try {
      const commandRepo = queryRunner.manager.getRepository(Command);
      const commandDetailsRepo =
        queryRunner.manager.getRepository(CommandDetails);
      const articleRepo = queryRunner.manager.getRepository(Article);

      const newCommand = await commandRepo.save(data);

      console.log("New Commande ", newCommand);

      if (!newCommand) throw new Error("Failed To create Command");

      let totalprice = 0;

      const commandDetailsSavingResult = await Promise.all(
        data.articles.map(async (article) => {
          const articleDetails = await articleRepo.findOne({
            where: {
              id: article.article_id,
            },
          });
          if (!articleDetails)
            throw new Error(
              `One of articles is not found please verify agian article_id : ${article.article_id}`
            );

          totalprice = totalprice + article.quantity * articleDetails.price;

          const detail = new CommandDetails();
          (detail.command_id = newCommand.id),
            (detail.article_id = article.article_id),
            (detail.quantity = article.quantity),
            (detail.batchnumber = article.batchNumber ?? null);

          return detail;
        })
      );

      await commandDetailsRepo.save(commandDetailsSavingResult);
      newCommand.totalprice = totalprice;
      await commandRepo.save(newCommand);
      return newCommand;
    } catch (error) {
      throw error;
    }
  }

  static async getCommandById(data: { id: number; distibutorId: number }) {
    try {
      const command = await commandRepository.findOne({
        where: { id: data.id },
        relations: ["pharmacy", "details"],
      });

      return command;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static async getAllCommands() {
    try {
      const commands = await commandRepository.find({
        relations: ["pharmacy", "details"],
      });

      return commands.map((a) => ({
        ...a,
        pharmacy: `${a.pharmacy?.name} (${a.pharmacy?.phone})`,
        pharmacyCode: a.pharmacy?.code,
      }));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static async updateCommand(queryRunner: QueryRunner, data: CreateCommandDTO) {
    try {
      if (!data.id)
        throw new Error(`Command id undefined in object passed for update`);

      const commandRepo = queryRunner.manager.getRepository(Command);
      const commandDetailsRepo =
        queryRunner.manager.getRepository(CommandDetails);
      const articleRepo = queryRunner.manager.getRepository(Article);

      const currentCommand = await commandRepo.findOne({
        where: {
          id: data.id,
        },
      });

      if (!currentCommand)
        throw new Error(`Command with id ${data.id} is not found`);

      let totalprice = 0;
      const commandDetailsSavingResult = await Promise.all(
        data.articles.map(async (article) => {
          const articleDetails = await articleRepo.findOne({
            where: {
              id: article.article_id,
            },
          });
          if (!articleDetails)
            throw new Error(
              `One of articles is not found please verify agian article_id : ${article.article_id}`
            );

          totalprice = totalprice + article.quantity * articleDetails.price;

          const detail = await commandDetailsRepo.findOne({
            where: {
              article_id: article.article_id,
              command_id: currentCommand.id,
            },
          });
          if (!detail) {
            const detail = new CommandDetails();
            (detail.command_id = currentCommand.id),
              (detail.article_id = article.article_id),
              (detail.quantity = article.quantity),
              (detail.batchnumber = article.batchNumber ?? null);

            return detail;
          } else {
            (detail.command_id = currentCommand.id),
              (detail.quantity = article.quantity),
              (detail.batchnumber = article.batchNumber ?? null);

            return detail;
          }
        })
      );
      currentCommand.totalprice = totalprice;
      await commandDetailsRepo.save(commandDetailsSavingResult);
      return;
    } catch (error) {
      throw error;
    }
  }

  static async updateCommandStatus(
    queryRunner: QueryRunner,
    data: {
      id: number;
      status: COMMAND_STATUS;
    }
  ) {
    try {
      if (!data.id)
        throw new Error(`Command id undefined in object passed for update`);

      const commandRepo = queryRunner.manager.getRepository(Command);

      const currentCommand = await commandRepo.findOne({
        where: {
          id: data.id,
        },
      });

      if (!currentCommand)
        throw new Error(`Command with id ${data.id} is not found`);

      currentCommand.status = data.status ?? currentCommand.status;
      await commandRepo.save(currentCommand);
      return currentCommand;
    } catch (error) {
      throw error;
    }
  }

  static async updateArticleQuantity(
    queryRunner: QueryRunner,
    data: {
      commandId: number;
      articleId: string;
      quantity: number;
    }
  ) {
    try {
      if (data.quantity < 0) {
        throw new Error("La quantité doit être supérieure ou égale à 0");
      }

      const commandDetailsRepo =
        queryRunner.manager.getRepository(CommandDetails);
      const commandRepo = queryRunner.manager.getRepository(Command);
      const articleRepo = queryRunner.manager.getRepository(Article);

      const commandDetail = await commandDetailsRepo.findOne({
        where: {
          command_id: data.commandId,
          article_id: data.articleId,
        },
      });

      if (!commandDetail) {
        throw new Error("Article non trouvé dans cette commande");
      }

      const article = await articleRepo.findOne({
        where: { id: data.articleId },
      });

      if (!article) {
        throw new Error("Article introuvable");
      }

      // Mettre à jour la quantité
      commandDetail.quantity = data.quantity;
      await commandDetailsRepo.save(commandDetail);

      // Recalculer le prix total de la commande
      const allDetails = await commandDetailsRepo.find({
        where: { command_id: data.commandId },
      });

      let newTotalPrice = 0;
      for (const detail of allDetails) {
        const art = await articleRepo.findOne({
          where: { id: detail.article_id },
        });
        if (art) {
          newTotalPrice += detail.quantity * art.price;
        }
      }

      const command = await commandRepo.findOne({
        where: { id: data.commandId },
      });

      if (command) {
        command.totalprice = newTotalPrice;
        await commandRepo.save(command);
      }

      return commandDetail;
    } catch (error) {
      throw error;
    }
  }

  static async removeArticleFromCommand(
    queryRunner: QueryRunner,
    data: {
      commandId: number;
      articleId: string;
    }
  ) {
    try {
      const commandDetailsRepo =
        queryRunner.manager.getRepository(CommandDetails);
      const commandRepo = queryRunner.manager.getRepository(Command);
      const articleRepo = queryRunner.manager.getRepository(Article);

      const commandDetail = await commandDetailsRepo.findOne({
        where: {
          command_id: data.commandId,
          article_id: data.articleId,
        },
      });

      if (!commandDetail) {
        throw new Error("Article non trouvé dans cette commande");
      }

      // Supprimer l'article de la commande
      await commandDetailsRepo.remove(commandDetail);

      // Recalculer le prix total de la commande
      const allDetails = await commandDetailsRepo.find({
        where: { command_id: data.commandId },
      });

      let newTotalPrice = 0;
      for (const detail of allDetails) {
        const art = await articleRepo.findOne({
          where: { id: detail.article_id },
        });
        if (art) {
          newTotalPrice += detail.quantity * art.price;
        }
      }

      const command = await commandRepo.findOne({
        where: { id: data.commandId },
      });

      if (command) {
        command.totalprice = newTotalPrice;
        await commandRepo.save(command);
      }

      return { success: true, message: "Article supprimé de la commande" };
    } catch (error) {
      throw error;
    }
  }
}
