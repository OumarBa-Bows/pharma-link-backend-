import axios from "axios";
import { MessageRequest } from "../../requests/message-request"; 
import { logger } from "../../app";
import * as Sentry from "@sentry/node";

export async function sendWhatsAppMessage(
  data:{
    phone:string,
    orderDetails?:any,
    message:string
  }
): Promise<any> {
  try {
    const messageRequest: MessageRequest = new MessageRequest()
    messageRequest.phone_number = data.phone
    messageRequest.message = data.message
    messageRequest.token = process.env.ULTRA_MSG_TOKEN!
    
    const formData = new URLSearchParams();
    formData.append("token", messageRequest.token);
    formData.append("to", `${messageRequest.phone_number}`);
    formData.append("body", messageRequest.message);

    const response = await axios.post(
      `${process.env.ULTRA_MSG_URL!}messages/chat`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    logger.info(
      `WhatsApp message sending success ${messageRequest.phone_number}`
    );
    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    if (axios.isAxiosError(error)) {
      logger.error(`WhatsApp message sending failed: ${error}`);
      throw new Error(`WhatsApp message sending failed: ${error.message}`);
    }
    throw error;
  }
}


export async function dejajAppSendWhatsAppMessage(
  data:{
    phone:string,
    message:string
  }
): Promise<any> {
  try {
    const messageRequest: MessageRequest = new MessageRequest()
    messageRequest.phone_number = data.phone
    messageRequest.message = data.message;
    messageRequest.token = process.env.DEJAJ_ULTRA_MSG_TOKEN!
    
    const formData = new URLSearchParams();
    formData.append("token", messageRequest.token);
    formData.append("to", `${messageRequest.phone_number}`);
    formData.append("body", messageRequest.message);

    const response = await axios.post(
      `${process.env.DEJAJ_ULTRA_MSG_URL!}messages/chat`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    logger.info(
      `Dejaj App WhatsApp message sending success ${messageRequest.phone_number}`
    );
    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    if (axios.isAxiosError(error)) {
      logger.error(`WhatsApp message sending failed: ${error}`);
      throw new Error(`WhatsApp message sending failed: ${error.message}`);
    }
    throw error;
  }
}

export async function JaavarAppSendWhatsAppMessage(
  data:{
    phone:string,
    message:string
  }
): Promise<any> {
  try {
    const messageRequest: MessageRequest = new MessageRequest()
    messageRequest.phone_number = data.phone
    messageRequest.message = data.message;
    messageRequest.token = process.env.JAAVAR_ULTRA_MSG_TOKEN!
    
    const formData = new URLSearchParams();
    formData.append("token", messageRequest.token);
    formData.append("to", `${messageRequest.phone_number}`);
    formData.append("body", messageRequest.message);

    const response = await axios.post(
      `${process.env.JAAVAR_ULTRA_MSG_URL!}messages/chat`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    logger.info(
      `Jaavar WhatsApp message sending success ${messageRequest.phone_number}`
    );
    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    if (axios.isAxiosError(error)) {
      logger.error(`Jaavar WhatsApp message sending failed: ${error}`);
      throw new Error(`Jaavar WhatsApp message sending failed: ${error.message}`);
    }
    throw error;
  }
}

export async function messageInfo(id:any){

  
}

export async function whatsappmessageInfo(
  data:{
    id:any,
  }
): Promise<any> {
  try {
    var params= {
      "token": process.env.JAAVAR_ULTRA_MSG_TOKEN!,
      "page": 1,
      "limit": 4,
      "status": "all",
      "sort": "desc"
  };

    const response = await axios.get(
      `${process.env.ULTRA_MSG_URL!}messages`,
      
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params:params
      }
    );
    
    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    if (axios.isAxiosError(error)) {
      logger.error(`WhatsApp message sending failed: ${error}`);
      throw new Error(`WhatsApp message sending failed: ${error.message}`);
    }
    throw error;
  }
}
