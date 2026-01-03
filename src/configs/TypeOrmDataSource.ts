import "reflect-metadata";
import { DataSourceOptions } from "typeorm";
import { QueryCustomLogger } from "./QueryCustomLogger";

const port = process.env.SUPABASE_DB_PORT as number | undefined;

export const AppDataSourceConfig: DataSourceOptions = {
  type: "postgres",
  host: process.env.SUPABASE_DB_HOST,
  port: port,
  username: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASS,
  database: process.env.SUPABASE_DBNAME,
  synchronize: false,
  logging: false,
  poolSize: 50,
  extra: {
    max: 50,
    idleTimeoutMillis: 30000,
  },
  // logger: new QueryCustomLogger(),
  entities: [__dirname + "/../entities/**/*.{ts,js}"],
};
