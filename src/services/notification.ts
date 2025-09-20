import * as Sentry from "@sentry/node";
import {
  Message,
  MulticastMessage,
  TopicMessage,
} from "firebase-admin/lib/messaging/messaging-api";
import admin, { messaging } from "firebase-admin";
import { logger } from "../app";

interface Notification {
  title?: string;
  body?: string;
}

export async function sendNotification(
  token: string,
  payload?: any,
  notification?: messaging.Notification
) {
  const message: messaging.Message = {
    notification,
    data: validateAndTransformData(payload),
    token,
    android: {
      ttl: 20 * 1000,
      priority: "high",
    },
    apns: {
      headers: {
        "apns-priority": "10",
        "apns-push-type": "alert",
      },
      payload: {
        aps: {
          alert: notification,
          badge: 1,
          category: "DELIVERY_REQUEST",
        },
      },
    },
  };

  try {
    return await admin.messaging().send(message);
  } catch (error: any) {
    logger.error("Failed to send FCM notification:", error?.message || error);
    Sentry.captureException(error);
    throw new Error(error?.message || "Unknown FCM error");
  }
}

export async function sendMultipleNotification(
  tokens: string[],
  payload?: any,
  notification?: Notification
) {
  const ttlInSeconds = 30;
  const expirationTimestamp = Math.floor(Date.now() / 1000) + ttlInSeconds;

  const message: MulticastMessage = {
    notification,
    data: validateAndTransformData(payload),
    tokens,
    android: {
      ttl: ttlInSeconds * 1000,
      priority: "high",
    },
    apns: {
      headers: {
        "apns-priority": "10",
        "apns-push-type": "alert",
      },
      payload: {
        aps: {
          alert: notification,
          badge: 1,
          category: "DELIVERY_REQUEST",
        },
      },
    },
  };

  try {
    return await admin.messaging().sendEachForMulticast(message);
  } catch (error: any) {
    logger.error(
      "Failed to send multicast FCM notification:",
      error?.message || error
    );
    Sentry.captureException(error);
    throw new Error(error?.message || "Unknown multicast FCM error");
  }
}

export async function sendNotificationToTopic(
  topic: string,
  notification?: Notification
) {
  const message: TopicMessage = {
    notification: notification,
    topic: topic,
  };

  try {
    await admin.messaging().send(message);
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
  }
}

function validateAndTransformData(
  input: any
): { [key: string]: string } | undefined {
  if (typeof input !== "object" || input === null) {
    return undefined;
  }

  const transformedData: { [key: string]: string } = {};

  for (const key in input) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      const value = input[key];
      if (typeof value === "string") {
        transformedData[key] = value;
      } else if (value !== null && value !== undefined) {
        transformedData[key] = String(value);
      }
    }
  }

  return transformedData;
}
