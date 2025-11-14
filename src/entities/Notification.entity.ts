import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { Command } from "./Command.entity";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: "pending" })
  status: string;

  @Column({ nullable: false })
  commandId: number;

  @ManyToOne(() => Command, (command) => undefined, { onDelete: "CASCADE" })
  @JoinColumn({ name: "commandId" })
  command: Command;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
