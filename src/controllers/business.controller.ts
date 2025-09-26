import { Request, Response } from "express";
import { logger, meilisearchClient, supabaseLiviiPos } from "../app";
import * as Sentry from "@sentry/node";

import { Index } from "meilisearch";
import { getLatLngFromGeoPoint } from "../utils/location/location";

export const syncBusinessesToMeilisearch = async (
  req: Request,
  res: Response
) => {
  try {
    logger.info("Starting full business sync to MeiliSearch");

    const indexName = process.env.MEILISEARCH_INDEX_BUSINESSES || "businesses";
    const businessIndex: Index = meilisearchClient.index(indexName);

    logger.info("Deleting existing documents from MeiliSearch index...");
    const deleteTask = await businessIndex.deleteAllDocuments();
    logger.info(`Deletion task submitted: taskUid = ${deleteTask.taskUid}`);

    // Optional: wait for task to finish (comment out if async preferred)
    await businessIndex.waitForTask(deleteTask.taskUid);
    logger.info("All documents deleted from MeiliSearch index.");

    // Step 2: Fetch all businesses from Supabase
    const { data: businesses, error } = await supabaseLiviiPos
      .from("business")
      .select("*");

    if (error) {
      logger.error("Failed to fetch businesses from Supabase", error);
      return res.status(500).json({ error: "Failed to fetch businesses" });
    }

    if (!businesses || businesses.length === 0) {
      logger.info("No businesses to sync");
      return res.status(200).json({ message: "No businesses to sync" });
    }

    // Step 3: Map and format documents
    const batch = businesses.map((business) => {
      let _geo = null;

      try {
        if (business.location) {
          _geo = getLatLngFromGeoPoint(business.location);
        }
      } catch (geoError) {
        logger.warn(
          `Failed to parse location for business ${business.id}`,
          geoError
        );
        Sentry.captureException(geoError);
      }

      return {
        id: business.id,
        business_name_fr: business.business_name_fr,
        business_name_ar: business.business_name_ar,
        logo: business.logo,
        status: business.status,
        type: business.type,
        owner_id: business.owner_id,
        created_at: business.created_at,
        updated_at: business.updated_at,
        started_at: business.started_at,
        is_started: business.is_started,
        code: business.code,
        _geo,
        location: business.location,
        phone: business.phone,
        popularity: business.popularity,
        zone: business.zone,
        is_open: business.is_open,
        whatsapp_number: business.whatsapp_number,
        schedule: business.schedule,
      };
    });

    // Step 4: Upload to MeiliSearch
    const response = await businessIndex.addDocuments(batch, {
      primaryKey: "id",
    });

    logger.info("Businesses synced successfully to MeiliSearch", response);

    return res.status(200).json({
      message: "Businesses synced successfully",
      taskUid: response.taskUid,
    });
  } catch (err) {
    logger.error("Failed to sync businesses to MeiliSearch", err);
    Sentry.captureException(err);
    return res.status(500).json({ error: "Sync failed", details: err });
  }
};

export const searchBusinesses = async (req: Request, res: Response) => {
  const { languageCode, searchNearbyFactor, filter, center, type } = req.body;

  if (!languageCode) {
    logger.error("Missing languageCode");
    return res.status(400).json({ error: "languageCode is required" });
  }

  try {
    const indexName = process.env.MEILISEARCH_INDEX_BUSINESSES || "";
    let businesses: any[] = [];
    let response;

    const filters: any = [];
    if (filter) {
      logger.warn(
        `Performing MeiliSearch text search for businesses with query: ${filter}`
      );

      if (filter === "popular businesses") {
        logger.info("Searching in MeiliSearch for popular businesses");

        response = await meilisearchClient.index(indexName).search("", {
          sort: ["popularity:desc", "status:desc"],
          limit: 30,
          showRankingScore: true,
        });
      } else {
        response = await meilisearchClient.index(indexName).search(filter, {
          sort: ["popularity:desc", "status:desc"],
          limit: 30,
          showRankingScore: true,
          attributesToSearchOn: ["business_name_fr", "business_name_ar"],
        });
      }

      businesses = response.hits;
      logger.warn(
        `Search sorted by POPULARITY found ${businesses.length} businesses`
      );
    } else {
      // If a center is provided, perform a nearby search
      if (center?.latitude && center?.longitude) {
        response = await meilisearchClient.index(indexName).search("", {
          filter: filters.length > 0 ? filters : undefined,
          sort:
            searchNearbyFactor === "POPULARITY"
              ? [
                  "popularity:desc",
                  `_geoPoint(${center.latitude}, ${center.longitude}):asc`,
                  "status:desc",
                ]
              : [
                  `_geoPoint(${center.latitude}, ${center.longitude}):asc`,
                  "popularity:desc",
                  "status:desc",
                ],
          limit: 30,
          showRankingScore: true,
        });

        businesses = response.hits;
        logger.warn(
          `Search nearby with ${searchNearbyFactor} found ${businesses.length} businesses`
        );
      } else {
        // If no center is provided, search only for premium businesses
        filters.push("type = 'PREMIUM'");

        response = await meilisearchClient.index(indexName).search("", {
          filter: filters.length > 0 ? filters : undefined,
          sort: ["popularity:desc", "status:desc"],
          limit: 30,
          showRankingScore: true,
        });

        businesses = response.hits;
        logger.warn(`Found ${businesses.length} premium businesses`);
      }
    }

    const result = businesses.map((business: any) => ({
      id: business.id,
      business_name_fr: business.business_name_fr,
      business_name_ar: business.business_name_ar,
      logo: business.logo || null,
      status: business.status !== undefined ? business.status : true,
      type: business.type || null,
      owner_id: business.owner_id,
      created_at: business.created_at,
      updated_at: business.updated_at,
      started_at: business.started_at,
      is_started: business.is_started || false,
      code: business.code,
      _geo: business._geo,
      location: business.location || null,
      phone: business.phone || null,
      popularity: business.popularity || 0,
      zone: business.zone || null,
      is_open: business.is_open || false,
      whatsapp_number: business.whatsapp_number || null,
      schedule: business.schedule || null,
    }));

    return res.status(200).send(result);
  } catch (error) {
    logger.error("Error in searchBusinesses:", error);
    Sentry.captureException(error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

export const syncBusinessFromTrigger = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
    logger.error("Missing business ID in webhook payload");
    return res.status(400).json({ error: "Missing business ID" });
  }

  logger.info(`Received sync request for business ID: ${id}`);

  try {
    const indexName = process.env.MEILISEARCH_INDEX_BUSINESSES || "businesses";
    const businessIndex = meilisearchClient.index(indexName);

    logger.info(`Fetching business from Supabase (ID: ${id})`);
    const { data: business, error } = await supabaseLiviiPos
      .from("business")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !business) {
      logger.error(
        `Failed to fetch business (ID: ${id}): ${JSON.stringify(error)}`
      );
      return res.status(404).json({ error: "Business not found" });
    }

    logger.info(`Business fetched: ${JSON.stringify(business)}`);

    let _geo = null;
    try {
      if (business.location) {
        _geo = getLatLngFromGeoPoint(business.location);
        logger.info(`Parsed _geo location: ${JSON.stringify(_geo)}`);
      }
    } catch (geoError) {
      logger.warn(`Failed to parse location for business ${id}: ${geoError}`);
      Sentry.captureException(geoError);
    }

    const payload = {
      id: business.id,
      business_name_fr: business.business_name_fr,
      business_name_ar: business.business_name_ar,
      logo: business.logo,
      status: business.status,
      type: business.type,
      owner_id: business.owner_id,
      created_at: business.created_at,
      updated_at: business.updated_at,
      started_at: business.started_at,
      is_started: business.is_started,
      code: business.code,
      _geo,
      location: business.location,
      phone: business.phone,
      popularity: business.popularity,
      zone: business.zone,
      is_open: business.is_open,
      whatsapp_number: business.whatsapp_number,
      schedule: business.schedule,
    };

    logger.info(`Upserting business into MeiliSearch index '${indexName}'...`);
    const addResponse = await businessIndex.addDocuments([payload], {
      primaryKey: "id",
    });

    logger.info(
      `MeiliSearch addDocuments response: ${JSON.stringify(addResponse)}`
    );

    logger.info(
      `Waiting for MeiliSearch task UID ${addResponse.taskUid} to complete...`
    );
    const taskResult = await businessIndex.waitForTask(addResponse.taskUid);

    logger.info(`MeiliSearch task completed: ${JSON.stringify(taskResult)}`);

    return res.status(200).json({ success: true, task: taskResult });
  } catch (err) {
    logger.error(`Error syncing business ${id} to MeiliSearch: ${err}`);
    Sentry.captureException(err);
    return res
      .status(500)
      .json({ error: "Internal error", details: String(err) });
  }
};
