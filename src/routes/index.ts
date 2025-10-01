import { Router } from "express";
import articeRoute from "./articles.route";
import authRoute from "./auth.route";
import userRoute from "./users.route";
import { authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use("/auth", authRoute);
router.use("/articles", authorize(["admin", "article"]), articeRoute);
router.use("/users", authorize(["admin", "user"]), userRoute);

export default router;
