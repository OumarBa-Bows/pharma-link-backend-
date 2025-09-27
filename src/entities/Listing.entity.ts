import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ListingDetail } from "./ListingDetail.entity";

@Entity("listings")
export class Listing {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: "timestamp", nullable: true })
  date?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => ListingDetail,
    (listingDetail: ListingDetail) => listingDetail.listing
  )
  listingDetails: ListingDetail[];
}
