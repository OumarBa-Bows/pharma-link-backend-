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

  @Column({ type: "date", nullable: true })
  end_date?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ListingDetail, (ld) => ld.listing, {
    cascade: true, //permet de sauvegarder les ListingDetails automatiquement
    onDelete: "CASCADE", //garantit suppression automatique des ListingDetails
  })
  listingDetails: ListingDetail[];
}
