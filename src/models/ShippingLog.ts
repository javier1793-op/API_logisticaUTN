// src/models/ShippingLog.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  AllowNull,
  BelongsTo,
} from 'sequelize-typescript';
import Shipping from './shippings';

@Table({ tableName: 'shipping_logs' })
class ShippingLog extends Model {
  @ForeignKey(() => Shipping)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare shipping_id: number;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare timestamp: Date;

  @AllowNull(false)
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
  @Column(DataType.STRING)
  declare message: string;

  @BelongsTo(() => Shipping)
  declare shipping: Shipping;
}

export default ShippingLog;