import { Router } from "express";
import articeRoute from "./articles.route";
import listingRoute from "./listings.route";
import authRoute from "./auth.route";
import userRoute from "./users.route";
import { authorize } from "../middlewares/auth.middleware";
import commandRoute from "./commands.route";
import authPharmacyRoute from "./pharmacy/auth.pharmacy.route";
import pharmacyRoute from "./pharmacies.route";
import summaryRoute from "./summary.route";
import categoryRoute from "./categories.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/articles", authorize(["admin", "article"]), articeRoute);
router.use("/categories", authorize(["admin", "article"]), categoryRoute);
router.use("/users", userRoute);
router.use("/listings", authorize(["admin", "article"]), listingRoute);
router.use(
  "/commands",
  authorize(["admin", "PHARMACY", "commande"]),
  commandRoute
);
router.use("/pharmacies", authorize(["admin", "pharmacy"]), pharmacyRoute);
router.use("/pharmacy/auth", authPharmacyRoute);
router.use("/summary", summaryRoute);

export default router;
