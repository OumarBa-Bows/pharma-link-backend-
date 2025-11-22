import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { PharmacyState } from '../enums/PharmacyState.enum';
import { User } from './User.entity';
import { Zone } from './Zone.entity';

import { PharmacyCustomerType } from "../enums/PharmacyCustomerType";
import { Customer } from "./Customer.entity";
import { UUID } from 'crypto';

@Entity({ name: "pharmacies" })
export class Pharmacy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ unique: true })
  code: string;
  @ManyToOne(() => Zone, { nullable: true })
  @JoinColumn({ name: 'zoneId' })
  zone: Zone;

  @Column({ nullable: true })
  email: string;
  @Column({ type: 'enum', enum: PharmacyState, default: PharmacyState.PENDING })
  state: PharmacyState;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
  
  @Column({ nullable: true })
  doctorName: string;

  @Column({ nullable: true })
  managerName: string;

  @Column({  nullable: false, default: "" })
  managerPhone: string;

  @Column({ nullable: false, default: "" })
  doctorPhone: string;

  @Column({type: "uuid", nullable: true, default:null})
  userId: UUID;

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
  phone: string;
  
  @Column({ nullable: true })
  zipCode: string;
  
  @Column({ nullable: true })
  city: string;
}