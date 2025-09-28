import { Router } from "express";
import articeRoute from "./articles.route";
import authRoute from "./auth.route";
import { authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use("/auth", authRoute);
router.use("/articles", authorize(["admin", "article"]), articeRoute);

export default router;
