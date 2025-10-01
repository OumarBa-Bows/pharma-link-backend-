export interface UserDto {
  id: number;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
  roles?: string[];
}
