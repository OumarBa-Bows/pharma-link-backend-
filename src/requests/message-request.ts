import { IsNotEmpty, Matches } from "class-validator";

export class MessageRequest {
  @IsNotEmpty({ message: "Message is required" })
  message!: string;

  @Matches(/^[234]\d{7}$/, { message: "Invalid Mauritanian phone number" })
  phone_number!: string;

  // token: string = process.env.ULTRA_MSG_TOKEN || "";
  token!: string;
}
