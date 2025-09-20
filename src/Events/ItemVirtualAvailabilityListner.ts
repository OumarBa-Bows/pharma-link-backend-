// redis-expire-listener.ts
import Redis from "ioredis"

import {  logger } from "../app"

import { ItemAvailabilityService } from "../services/ItemAvailabilityService"
import { GlobalKeys } from "../configs/GlobalKeys.config";

console.info(`REDIS_EVENT_LISTNER OF VIRTUAL ITEM PREPARATION`)

const redisSub = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
});

redisSub.psubscribe("__keyevent@0__:expired")

redisSub.on("pmessage", async (_pattern, _channel, key) => {

  if (key.startsWith(GlobalKeys.VIRTUAL_ITEM_PREP_KEY)) {
    logger.info(`VIRTUAL_AVAILABILTY_EVENT  STARTED for key: ${key}`);
    const virtualItemId = key.split("_")[1]
    
    if (!virtualItemId) {
      logger.error(`VIRTUAL_AVAILABILTY_EVENT : Invalid key format: ${key}`);
      return;
    }
    await ItemAvailabilityService.completeVirtualAvailability(Number(virtualItemId))
    
   
  }
})
