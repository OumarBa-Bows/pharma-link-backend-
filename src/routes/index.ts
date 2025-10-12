import { Router } from "express";
import articeRoute from "./articles.route";
import authRoute from "./auth.route";
import userRoute from "./users.route";
import { authorize } from "../middlewares/auth.middleware";
import pharmacyRoute from "./pharmacies.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/articles", authorize(["admin", "article"]), articeRoute);
router.use("/users", authorize(["admin", "user"]), userRoute);
router.use("/pharmacies", authorize(["admin", "pharmacy"]), pharmacyRoute);

export default router;
