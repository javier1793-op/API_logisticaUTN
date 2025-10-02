
import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull,
  Unique,
  Default,
  HasMany,
} from 'sequelize-typescript';
import Address from './Address';
import Shipping from './shippings';

@Table({ tableName: 'users' })
class User extends Model {
  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare name: string;

  @AllowNull(false)
  @Column(DataType.STRING(60))
  declare password: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(50))
  declare email: string;

  @Column(DataType.STRING(6))
  declare token?: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare confirm: boolean;

  @HasMany(() => Address, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare addresses: Address[];

  @HasMany(() => Shipping, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare shippings: Shipping[];
}

export default User;