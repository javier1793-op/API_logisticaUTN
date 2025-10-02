
import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './User';

@Table({ tableName: 'addresses' })
class Address extends Model {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare user_id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare street: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare city: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare state: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare postal_code: string;

  @AllowNull(false)
  @Column(DataType.STRING(2))
  declare country: string;

  @BelongsTo(() => User)
  declare user: User;
}

export default Address;