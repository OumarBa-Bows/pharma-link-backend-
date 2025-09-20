export class BusinessStateError extends Error {
  public code: string;
  public business:any;
  constructor(message: string,business:any) {
    super(message);
    this.name = "BUSINESSCOSEDERROR";
    this.business = business
    this.code = "ERROR_CLOSED_BUSINESS";
  }
}