import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRoles } from '../enums/enum';
import { isEnum } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.User })
  role: UserRoles;
}
