import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ListingDetail } from "./ListingDetail.entity";
import { Category } from "./Category.entity";

@Entity("articles")
export class Article {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.articles, {
    nullable: true,
  })
  @JoinColumn({ name: "categoryId" })
  category: Category;

  @Column("float")
  price: number;

  @Column("int", { default: 0 })
  availableQuantity: number;

  @Column({ nullable: true })
  imageLink?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: "date", nullable: true })
  expiryDate?: Date;

  @Column({ default: true })
  isPublished?: boolean;

  @Column({ nullable: true })
  barcode?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ListingDetail, (ld) => ld.article)
  listingDetails: ListingDetail[];
}
