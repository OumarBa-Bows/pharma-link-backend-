import { UUID } from "crypto";
import { ArticleDto } from "./ArticleDto";
import { COMMAND_STATUS } from "../enums/CommandStatus";

export interface CreateCommandDTO {
  id?:any,
  // Obligatoire
  code: string;                // code unique ou identifiant de commande
  status: COMMAND_STATUS|COMMAND_STATUS.pending;              // status de la commande
  pharmacyId: UUID;          // référence vers Pharmacy (UUID)

  articles:{
    article_id:UUID,
    quantity:number,
    batchNumber:any
  }[]

  // Optionnel
  commandreference?: string;
  invoicereference?: string;
  totalprice?: number;         // par défaut 0 si non fourni
}
