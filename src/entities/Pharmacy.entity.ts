import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { PharmacyState } from '../enums/PharmacyState.enum';
import { User } from './User.entity';
import { Zone } from './Zone.entity';

export enum CustomerType {
  PHARMACY = 'PHARMACY',
  DEPOT = 'DEPOT'
}

@Entity("pharmacies")
export class Pharmacy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @ManyToOne(() => Zone, { nullable: true })
  @JoinColumn({ name: 'zoneId' })
  zone: Zone;

  @Column({ type: 'enum', enum: PharmacyState, default: PharmacyState.PENDING })
  state: PharmacyState;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  doctorName: string;

  @Column({ nullable: true })
  managerName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'enum', enum: CustomerType, default: CustomerType.PHARMACY })
  customerType: CustomerType;

  @Column('point', { nullable: true })
  location: string;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
