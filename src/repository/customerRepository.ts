import { AppDataSource } from "../configs/data-source";
import { Customer } from "../entities/Customer.entity";
import { Repository } from "typeorm";

export function getCustomerRepository(): Repository<Customer> {
  return AppDataSource.getRepository(Customer);
}