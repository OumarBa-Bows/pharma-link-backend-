import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Pharmacy } from './Pharmacy.entity';

@Entity('zones')
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  wilayaId: string;

  @OneToMany(() => Pharmacy, (pharmacy) => pharmacy.zone)
  pharmacies: Pharmacy[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
