import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ListingDetail } from "./ListingDetail.entity";

@Entity("articles")
export class Article {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column("float")
  price: number;

  @Column({ nullable: true })
  imageLink?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: "date", nullable: true })
  expiryDate?: Date;

  @Column({ nullable: true })
  barcode?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ListingDetail, (ld) => ld.article)
  listingDetails: ListingDetail[];
}
