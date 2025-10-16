import { Router } from "express";
import { ListingController } from "../controllers/ListingController";
import {
  createListingValidator,
  updateListingValidator,
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

export default listingRoute;
