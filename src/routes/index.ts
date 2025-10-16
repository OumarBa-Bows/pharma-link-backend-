import { Router } from "express";
import articeRoute from "./articles.route";
import listingRoute from "./listings.route";
import authRoute from "./auth.route";
import userRoute from "./users.route";
import { authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use("/auth", authRoute);
router.use("/articles", authorize(["admin", "article"]), articeRoute);
router.use("/users", authorize(["admin", "user"]), userRoute);
router.use("/listings", authorize(["admin", "article"]), listingRoute);

export default router;
