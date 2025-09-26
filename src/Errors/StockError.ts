export class StockError extends Error {
  public code: string;
  public business:any;
  constructor(message: string,business:any) {
    super(message);
    this.name = "StockError";
    this.business = business
    this.code = "INVENTORY_ERROR";
  }
}