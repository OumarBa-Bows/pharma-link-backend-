import { Router } from "express";
import { authorize } from "../middlewares/auth";
import { OrderWebhookController } from "../controllers/OrderWebhookController";

const orderWebHookRoute = Router();


// create  order endpoint  
orderWebHookRoute.post(
    "/notification-message",
    // authorize(['admin','customer','wheels','deliver','supabase']),
   
    OrderWebhookController.handleOrderNotificationWebhook

)

export default orderWebHookRoute;
