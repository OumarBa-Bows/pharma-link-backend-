import { Router } from "express";
import { ListingController } from "../controllers/ListingController";
import {
  createListingValidator,
  updateListingValidator,
  uploadExcelValidator,
} from "../middlewares/listing.middleware";

const listingRoute = Router();
listingRoute.post("/", createListingValidator, ListingController.create);
listingRoute.post(
  "/update/:id",
  updateListingValidator,
  ListingController.update
);
listingRoute.get("/", ListingController.getAll);
listingRoute.get("/:id", ListingController.getById);
listingRoute.get("/delete/:id", ListingController.delete);
listingRoute.post("/import", uploadExcelValidator, ListingController.import);
listingRoute.get("/show/items/:id", ListingController.getDetailsByListingId);
export default listingRoute;
