import { PharmacyCustomerType } from "../enums/PharmacyCustomerType";

export interface PharmacyDto {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    customerType: PharmacyCustomerType;
    location: string;
    zoneId: string;
    customerId: number;
    createdAt: Date;
    updatedAt: Date;
}
