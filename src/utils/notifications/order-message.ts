import { AppDataSource, logger } from "../../app";
import { SYSTEM_MESSAGES } from "../../configs/SystemMessage";
import { Customer } from "../../entities/Customer.entity";
import { Order } from "../../entities/Order.entity";
import { OrdersOrigin } from "../../enums/OrderOrigin";
import { OrderStatus } from "../../enums/OrderStatus";
import { OrderType } from "../../enums/OrderType";
import { CustomerService } from "../../services/CustomerService";
import { dejajAppSendWhatsAppMessage, JaavarAppSendWhatsAppMessage, sendWhatsAppMessage } from "./send-whatsapp-message";
import * as Sentry from "@sentry/node";

export async function getOrderNotificationMessage(data:
    {origin: OrdersOrigin,message:string,phone?:string}) {
    logger.info(`getOrderNotificationMessage: ${data.origin} - ${data.message} - ${data.phone}`);
    if(process.env.PRODUCTION){
        switch (data.origin) {
            
            case OrdersOrigin.DEJAJAPP:
                logger.info(`getOrderNotificationMessage:CASE 1`)
            return await dejajAppSendWhatsAppMessage({
                phone: data.phone??"",
                message:data.message
                
            });
            case OrdersOrigin.LIIVIPOS:
                logger.info(`getOrderNotificationMessage:CASE 2`)
            return await sendWhatsAppMessage({
                phone: data.phone?? '',
                message:data.message,
                
            });
            case OrdersOrigin.JAAVAR:
                logger.info(`getOrderNotificationMessage:CASE 3`)
            return await JaavarAppSendWhatsAppMessage({
            phone: data.phone?? '',
                message:data.message,
                
            });;
            default:
            return  await sendWhatsAppMessage({
                phone: data.phone?? '',
                message:data.message,
            });
        }
    }
}

export async function sendOrderNotificationByStatus(
  data: {
    order: Partial<Order>,
    message: string,
    phone?: string,
    language?: "fr" | "ar"
  },
  
) {
  const { order, message, phone } = data;
  let notificationMessage = message;
  let key: keyof typeof SYSTEM_MESSAGES;
  if(order.origin != OrdersOrigin.DEJAJAPP){
    return ; 
  }
  logger.info(`sendOrderNotificationByStatus: ${order.id} - ${order.status} - ${order.type} - ${order.origin}`);
  
  try {
    const customer = await AppDataSource.getRepository(Customer).findOne({
      where: { phone: order.customer_phone }
    });
    if (customer) {
      const preferredLang = (customer.prefered_language ?? "fr").toLowerCase();
      data.language = preferredLang === "ar" ? "ar" : "fr";
      logger.info(`sendOrderNotificationByStatus: Customer found with phone ${order.customer_phone}`);
    } else {
       data.language =  "fr";
      logger.warn(`sendOrderNotificationByStatus: No customer found with phone ${order.customer_phone}`);
    }
    switch (order.status) {
      case OrderStatus.PENDING:
        logger.info(`sendOrderNotificationByStatus:CASE 1`);
        key = order.type === OrderType.DELIVERY 
          ? "AT_ORDER_CREATION_DELIVERY_ORDERS"
          : "AT_ORDER_CREATION_PICKUP_ORDERS";
        notificationMessage = getSystemMessage(key, data.language??"fr");
        logger.info(`sendOrderNotificationByStatus:CASE 1 OK`);
        break;

      case OrderStatus.ACCEPTED:
        logger.info(`sendOrderNotificationByStatus:CASE 2`);
        key = order.type === OrderType.DELIVERY 
          ? "AT_ORDER_CONFIRMATION_DELIVERY_ORDERS"
          : "AT_ORDER_CONFIRMATION_PICKUP_ORDERS";
        notificationMessage = getSystemMessage(key, data.language??"fr",{ticket: order.ticket_number ?? ""});
        logger.info(`sendOrderNotificationByStatus:CASE 2 OK`);
        break;

      case OrderStatus.DISPATCHED:
        logger.info(`sendOrderNotificationByStatus:CASE 3`);
        key = order.type === OrderType.DELIVERY 
          ? "AT_ORDER_DISPATCHED_DELIVERY_ORDERS"
          : "AT_ORDER_DISPATCHED_PICKUP_ORDERS";
        notificationMessage = getSystemMessage(key, data.language??"fr");
        logger.info(`sendOrderNotificationByStatus:CASE 3 OK`);
        break;

      default:
        return;
    }

    console.log(`sendOrderNotificationByStatus: notificationMessage: ${order.origin}`);
    return await getOrderNotificationMessage({
      origin: order.origin ?? OrdersOrigin.LIIVIPOS,
      message: notificationMessage,
      phone: order.customer_phone ?? phone
    });
  } catch (error) {
    logger.error(`Error in sendOrderNotificationByStatus: ${error}`);
    Sentry.captureException(error);
    throw error;
  }
}


// export function getSystemMessage(
//   key: keyof typeof SYSTEM_MESSAGES,
//   language: "fr" | "ar" = "fr"
// ): string {
//   const messageObj = SYSTEM_MESSAGES[key];
//   if (!messageObj) return "";
//   return messageObj[language] || "";
// }
//test

export function getSystemMessage(
  key: keyof typeof SYSTEM_MESSAGES,
  language: "fr" | "ar" = "fr",
  variables?: Record<string, string | number>
): string {
  const messageObj = SYSTEM_MESSAGES[key];
  if (!messageObj) return "";
  let message = messageObj[language] || "";

  if (variables) {
    for (const [varKey, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`{${varKey}}`, "g"), String(value));
    }
  }
  return message;
}


