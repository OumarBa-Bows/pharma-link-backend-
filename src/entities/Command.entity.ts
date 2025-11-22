import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { Distributor } from "./Distributor.entity";
import { CommandDetails } from "./CommandDetails.entity";
import { Pharmacy } from "./Pharmacy.entity";
import { COMMAND_STATUS } from "../enums/CommandStatus";


@Entity({name:"command"})
export class Command {
  @PrimaryGeneratedColumn()
  id: number;


  @Column()
  code: string;

  @Column({type:"enum", enum:COMMAND_STATUS, default:COMMAND_STATUS.pending})
  status: COMMAND_STATUS|COMMAND_STATUS.pending;

  @Column({ type: "boolean", default: false }) 
  viewed: boolean;

  @Column({ nullable: true })
  commandreference: string;

  @Column({ nullable: true })
  invoicereference: string;

  @Column({ type: "double precision", default: 0, nullable: true })
  totalprice: number;

  @CreateDateColumn({ type: "timestamp", nullable: true })
  date: Date;

  @Column()
  pharmacyId: string;


  @ManyToOne(() => Pharmacy)
  @JoinColumn({ name: "pharmacyId" })
  pharmacy: Pharmacy;

  @OneToMany(() => CommandDetails, detail => detail.command)
  details: CommandDetails[];
}
