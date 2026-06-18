import { Column, Entity, PrimaryColumn, Unique } from "typeorm";

@Entity({ name: "users", schema: "auth" })
@Unique(["phone"])
export class AuthUser {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ type: "uuid", nullable: true })
  instance_id?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  aud?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  role?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email?: string;

  @Column({ type: "text", nullable: true })
  phone?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  encrypted_password?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  confirmation_token?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  recovery_token?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email_change_token_new?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email_change?: string;

  @Column({ type: "jsonb", nullable: true })
  raw_user_meta_data?: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  raw_app_meta_data?: Record<string, any>;

  @Column({ type: "timestamptz", nullable: true })
  created_at?: Date;

  @Column({ type: "timestamptz", nullable: true })
  updated_at?: Date;

  @Column({ type: "timestamptz", nullable: true })
  banned_until?: Date | null;

  @Column({ type: "boolean", default: false })
  is_sso_user!: boolean;

  @Column({ type: "boolean", default: false })
  is_anonymous!: boolean;
}
