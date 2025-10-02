import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull,
  Default,
  ForeignKey,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import ProductItem from './ProductItem';
import ShippingLog from './ShippingLog';
import User from './User';

@Table({ tableName: 'shippings' })
class Shipping extends Model {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @AllowNull(false)
  @Default('created')
  @Column(
    DataType.ENUM(
      'created',
      'reserved',
      'in_transit',
      'delivered',
      'cancelled',
      'in_distribution',
      'arrived'
    )
  )
  declare status: string;

  @AllowNull(false)
  @Column(DataType.ENUM('air', 'sea', 'rail', 'road'))
  declare transport_type: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare departure_postal_code: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare estimated_delivery_at: Date;

  @Column(DataType.DATE)
  declare cancelled_at?: Date;

  @HasMany(() => ProductItem, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare products: ProductItem[];

  @HasMany(() => ShippingLog, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare logs: ShippingLog[];
}

export default Shipping;