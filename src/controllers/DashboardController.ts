import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard/DashboardService";

export class DashboardController {
  static async getSummary(req: Request, res: Response) {
    try {
      const summary = await DashboardService.getSummary();
      return res.status(200).json(summary);
    } catch (error: any) {
      return res.status(500).send({
        success: false,
        message: error?.message || "Error getting dashboard summary",
      });
    }
  }
}
