import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Listing } from "./Listing.entity";
import { Article } from "./Article.entity";

@Entity("listing_details")
export class ListingDetail {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  listingId: string;

  @Column({ nullable: false })
  articleId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  status?: string;

  @Column({ type: "timestamp", nullable: true })
  date?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Listing, (listing) => listing.listingDetails, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "listingId" })
  listing: Listing;

  @ManyToOne(() => Article, (article) => article.listingDetails, {
    eager: true, //charge automatiquement les articles liés
  })
  @JoinColumn({ name: "articleId" })
  article: Article;
}
