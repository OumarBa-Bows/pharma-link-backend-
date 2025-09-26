import axios from "axios";
import { logger } from "../app";
import { body } from "express-validator";
import { Order } from "../entities/Order.entity";
import { link } from "fs";
import * as Sentry from "@sentry/node";



export async function n8nSendMessageToOperationChanel(data:
  {
    order:Partial<Order>,
    message?:string,
    link?:any
  }
): Promise<any> {
  if(process.env.PRODUCTION){
    try {

      const response = await axios.post(
        `${process.env.N8N_OPERATION_WEBHOOK!}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          
            env: process.env.NODE_ENV,
            order_id: data.order.id,
            origin:data.order.origin,
            link:data.link,
            message: data.message || "",
          
          
        }
      );
      logger.info(
        `N8N process Operation-Chanel webhook success `
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        //console.log('N8N process responsefailed:',error)
        logger.error(`N8N process Operation-Chanel  webhookfailed: ${error}`);
        Sentry.captureException(error);
        throw new Error(`N8N process webhook ${error.message}`);
      }
      Sentry.captureException(error);
      throw error;
    }
  }else{
    return  `N8N process webhook message`
  }
 
}



export async function n8nSendMessageToShereeqChanel(data:
  {
    order:Partial<Order>,
    message?:string,
    link?:any
  }
): Promise<any> {
  if(!process.env.PRODUCTION){
    try {

      const response = await axios.post(
        `${process.env.N8N_SHEREEQ_WEBHOOK!}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          
            env: process.env.NODE_ENV,
            order_id: data.order.id,
            origin:data.order.origin,
            link:data.link,
            message: data.message || "",
          
          
        }
      );
      logger.info(
        `N8N process Operation-Chanel webhook success `
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        //console.log('N8N process responsefailed:',error)
        logger.error(`N8N process Operation-Chanel  webhookfailed: ${error}`);
        Sentry.captureException(error);
        throw new Error(`N8N process webhook ${error.message}`);
      }
      Sentry.captureException(error);
      throw error;
    }
  }else{
    return  `N8N process webhook message`
  }
 
}