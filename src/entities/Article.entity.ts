import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ListingDetail } from "./ListingDetail.entity";
import { ArticleCategory } from "../enums/ArticleCategory";

@Entity("articles")
export class Article {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column()
  name: string;

  @Column("float")
  price: number;

  @Column("int", {default: 0})
  availableQuantity: number;
  
  @Column({ nullable: true })
  imageLink?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: "enum", enum: ArticleCategory, default: ArticleCategory.DEFAULT, nullable: true })
  category: ArticleCategory;

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
