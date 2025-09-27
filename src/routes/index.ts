import { Router } from "express";
import articeRoute from "./article.route";
import authRoute from "./auth.route";
import { authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use("/auth", authRoute);
router.use("/article", authorize(["admin", "article"]), articeRoute);

export default router;
