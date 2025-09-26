// redis-expire-listener.ts
import Redis from "ioredis"

import { AppDataSource, logger } from "../app"
import { Order } from "../entities/Order.entity"
import { OrderStatus } from "../enums/OrderStatus"
import { n8nSendMessageToOperationChanel } from "../utils/n8n-webhook"
import { GlobalKeys } from "../configs/GlobalKeys.config"
import { OrderType } from "../enums/OrderType"
import { OrdersOrigin } from "../enums/OrderOrigin"
import { OrderReminderService } from "../services/OrderReminderService"
import { OrderService } from "../services/OrderService"
import { OrderJobStatus } from "../enums/OrderJobStatus"

console.info(`REDIS_EVENT_LISTNER`)

const redisSub = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
});

redisSub.psubscribe("__keyevent@0__:expired")

redisSub.on("pmessage", async (_pattern, _channel, key) => {
  if (key.startsWith(GlobalKeys.PENDING_ORDER_KEY)) {
    const orderId = key.split("_")[1]
    const orderRepo = AppDataSource.manager.getRepository(Order)
    const order = await orderRepo.findOneBy(
      { id: Number(orderId),status:OrderStatus.PENDING }
    )
    if(!order){
        logger.info(`PENDINGORDERREDIS_EVENT : NOTHING TO DO for order not pending : ${orderId}`)
    }

    if (
      order &&
      order.type == OrderType.DELIVERY &&
      order.origin !== undefined &&
      [OrdersOrigin.ADMIN, OrdersOrigin.LIVIIAPP].includes(order.origin)
    ) {
         logger.info(`PENDINGORDERREDIS_EVENT :NOTIFY TO WHEELS_OPS: ${orderId}`)
        await n8nSendMessageToOperationChanel({
          order:order,
          link:`${process.env.ADMIN_OPERATION_LINK}${order.delivery_id}`,
          message:`🚨🚚COMMANDE #${order.id}  Heure🕐:${order.created_at} EN ATTENTE CLICKER LIEN 🔽 `
        })
    }
  }

  if (key.startsWith(GlobalKeys.SCHEDULED_ORDER_KEY)) {
    logger.info(`SCHEDULEDORDER_EVENT : NOTHING TO DO for order not scheduled `)
    const orderId = key.split("_")[1]
    const orderRepo = AppDataSource.manager.getRepository(Order)
    const order = await orderRepo.findOneBy(
      { id: Number(orderId),status:OrderStatus.PENDING }
    )
    if(!order){
        logger.info(`SCHEDULEDORDER_EVENT : NOTHING TO DO for order not scheduled : ${orderId}`)
    }

    if (
      order &&
      order.scheduled_at
    ) {
         logger.info(`SCHEDULED_ORDER EVENT : CREATE ORDER JOB: ${orderId}`)
         if(order.automatic_confirm){
           const result = await OrderService.confirmOrder(order.id)
          if(!result)await OrderReminderService.createOrderReminderRedis(order.id,OrderJobStatus.STARTED);
          else await OrderReminderService.createOrderReminderRedis(order.id,OrderJobStatus.CLOSED);
         }
          else{
             await OrderReminderService.createOrderReminderRedis(order.id,OrderJobStatus.STARTED);
          }
       
    }
  }
})
