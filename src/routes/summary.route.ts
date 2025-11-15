import { Router } from "express";
import { authorize } from "../middlewares/auth.middleware";
import { DashboardController } from "../controllers/DashboardController";

const summaryRoute = Router();

summaryRoute.get("/"
    , DashboardController.getSummary);

export default summaryRoute;
