import { Logger, QueryRunner } from "typeorm";
import { logger } from "../app";

// Implémenter l'interface Logger de TypeORM
export class QueryCustomLogger implements Logger {
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    logger.info(`Query: ${query}`, { parameters });
  }

  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    logger.error(`Query Error: ${error}`, { query, parameters });
  }

  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    logger.warn(`Slow Query (${time} ms): ${query}`, { parameters });
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    logger.info(`Schema Build: ${message}`);
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    logger.info(`Migration: ${message}`);
  }

  log(level: "log" | "info" | "warn" | "error", message: any, queryRunner?: QueryRunner) {
    switch (level) {
      case "log":
        logger.info(message);
        break;
      case "info":
        logger.info(message);
        break;
      case "warn":
        logger.warn(message);
        break;
      case "error":
        logger.error(message);
        break;
    }
  }
}
