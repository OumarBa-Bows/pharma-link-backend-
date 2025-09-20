import { Settings } from "meilisearch";
import { logger, meilisearchClient } from "../app";
import * as Sentry from "@sentry/node";

const productsIndexConfig: Settings = {
  searchableAttributes: [
    "name_fr",
    "name_ar",
    "description_fr",
    "description_ar",
    "code",
    "business_name_fr",
    "business_name_ar",
    "category_name_fr",
    "category_name_ar",
  ],

  filterableAttributes: [
    "business_id",
    "business_code",
    "code",
    "category_id",
    "is_available",
    "availability",
    "is_sellable",
    "is_inventory_tracked",
    "type",
    "source_table",
    "price",
    "quantity",
    "display_order",
  ],

  sortableAttributes: [
    "price",
    "display_order",
    "created_at",
    "updated_at",
    "name_fr",
    "name_ar",
    "is_available",
    "availability",
    "quantity",
    "category_id",
  ],

  rankingRules: [
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness",
    "is_available:desc",
    "display_order:asc",
  ],

  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 3,
      twoTypos: 6,
    },
    disableOnWords: [],
    disableOnAttributes: ["code", "business_code"], 
  },

  pagination: {
    maxTotalHits: 1000, 
  },

  faceting: {
    maxValuesPerFacet: 100,
    sortFacetValuesBy: {
      "*": "count" as const, 
      display_order: "alpha" as const, 
    },
  },

  distinctAttribute: null, 
};

export async function initMeilisearchProductsIndex() {
  try {
    const productsIndexName =
      process.env.MEILISEARCH_INDEX_PRODUCTS || "products";

    const productsIndex = meilisearchClient.index(productsIndexName);

    await productsIndex.updateSettings(productsIndexConfig);

    logger.info("Products index settings updated successfully");
    return true;
  } catch (error) {
    logger.error(`Error initializing Meilisearch products index: ${error}`);
    Sentry.captureException(error);
    throw error;
  }
}
