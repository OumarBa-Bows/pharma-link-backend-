import { Router } from "express";
import articeRoute from "./articles.route";
import listingRoute from "./listings.route";
import authRoute from "./auth.route";
import userRoute from "./users.route";
import { authorize } from "../middlewares/auth.middleware";
import commandRoute from "./commands.route";
import authPharmacyRoute from "./pharmacy/auth.pharmacy.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/articles", authorize(["admin", "article"]), articeRoute);
router.use("/users", userRoute);
router.use("/listings", authorize(["admin", "article"]), listingRoute);
router.use("/commands", authorize(["admin", "article"]), commandRoute);

router.use("/pharmacy/auth", authPharmacyRoute);

export default router;
