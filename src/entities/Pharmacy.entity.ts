import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { PharmacyCustomerType } from "../enums/PharmacyCustomerType";
import { PharmacyState } from "../enums/PharmacyState";
import { Zone } from "./Zone.entity";
import { Customer } from "./Customer.entity";
import { Listing } from "./Listing.entity";

@Entity({ name: "pharmacies" })
export class Pharmacy {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  email: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @Column({ nullable: true })
  doctorName: string;

  @Column({ nullable: true })
  managerName: string;

  @Column({
    type: "enum",
    enum: PharmacyCustomerType,
    default: PharmacyCustomerType.PHARMACY,
  })
  customerType: PharmacyCustomerType;

  @Column({ type: "point", nullable: true })
  location: string; // TypeORM ne supporte pas directement "point", on le mappe en string ou custom type

  @Column({ nullable: true })
  zoneId: string;

  @Column({ nullable: true })
  customerId: number;
  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({
    type: "enum",
    enum: PharmacyState,
    default: PharmacyState.PENDING,
  })
  state: PharmacyState;
  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer: Customer;
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Zone)
  @JoinColumn({ name: "zoneId" })
  zone: Zone;
  
    @Column()
  phone: string;
  
    @Column()
  zipCode: string;
  
    managerName: string;
  @Column()
  state: string;
  
    @Column()
  city: string;
}
