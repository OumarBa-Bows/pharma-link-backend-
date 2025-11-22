import { Router } from "express";

import {
  createListingValidator,
  updateListingValidator,
} from "../middlewares/listing.middleware";
import { CommandController } from "../controllers/CommandController";
import { createCommandValidator, updateCommandValidator, updateStatusCommandValidator } from "../middlewares/command.middleware";

const commandRoute = Router();
commandRoute.post("/create",createCommandValidator, CommandController.create);
commandRoute.post("/update",updateCommandValidator, CommandController.update);
commandRoute.post("/status-update",updateStatusCommandValidator, CommandController.updateStatus);
 
commandRoute.post("/get/by-id", CommandController.getById);
commandRoute.post("/get/by-distributor", CommandController.getAllByDistributor);


export default commandRoute;
