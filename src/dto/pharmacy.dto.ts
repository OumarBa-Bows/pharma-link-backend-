import { Pharmacy } from '../entities/Pharmacy.entity';
import { IsString, IsEmail, IsOptional, IsEnum, IsUUID, IsObject, IsLatitude, IsLongitude, ValidateIf } from 'class-validator';
import { PharmacyState } from '../enums/PharmacyState.enum';

export enum CustomerType {
  PHARMACY = 'PHARMACY',
  DEPOT = 'DEPOT'
}

export class CreatePharmacyDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  code: string;

  @IsString()
  @IsOptional()
  doctorName?: string;

  @IsString()
  @IsOptional()
  managerName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  wilayaId?: string;

  @IsEnum(CustomerType)
  @IsOptional()
  customerType?: CustomerType;

  @IsUUID()
  @IsOptional()
  userId?: string;
}

export class UpdatePharmacyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  doctorName?: string;

  @IsString()
  @IsOptional()
  managerName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  wilayaId?: string;

  @IsEnum(CustomerType)
  @IsOptional()
  customerType?: CustomerType;

  @IsUUID()
  @IsOptional()
  userId?: string;
}

export class UpdatePharmacyStateDto {
  @IsEnum(PharmacyState, { message: 'Invalid pharmacy state' })
  state: PharmacyState;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class PharmacyResponseDto {
  id: string;
  name: string;
  address: string;
  code: string;
  doctorName?: string;
  managerName?: string;
  email?: string;
  state: PharmacyState;
  customerType: CustomerType;
  location?: string;
  zone?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(pharmacy: Pharmacy) {
    this.id = pharmacy.id;
    this.name = pharmacy.name;
    this.address = pharmacy.address;
    this.code = pharmacy.code;
    this.doctorName = pharmacy.doctorName || undefined;
    this.managerName = pharmacy.managerName || undefined;
    this.email = pharmacy.email || undefined;
    this.state = pharmacy.state;
    this.customerType = pharmacy.customerType;
    this.location = pharmacy.location || undefined;
    this.createdAt = pharmacy.createdAt;
    this.updatedAt = pharmacy.updatedAt;

    if (pharmacy.zone) {
      this.zone = {
        id: pharmacy.zone.id,
        name: pharmacy.zone.name
      };
    }

    if (pharmacy.user) {
      this.user = {
        id: `${pharmacy.user.id}`,
        email: pharmacy.user.email
      };
    }
  }
}
