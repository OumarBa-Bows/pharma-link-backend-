import { Request, Response } from "express";
import { logger } from "../app";

const serverUp = async (req: Request, res: Response) => {
  logger.info("Server is up and notifications sent!");
  return res.status(200).send("Server is up!");
};

export default {
  serverUp,
};
