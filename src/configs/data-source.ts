import "reflect-metadata";
import { DataSource } from "typeorm";
import { AppDataSourceConfig } from "./TypeOrmDataSource";

export const AppDataSource = new DataSource(AppDataSourceConfig);
