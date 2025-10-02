
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

@Table({ tableName: 'product_items' })
class ProductItem extends Model {
  @ForeignKey(() => Shipping)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare shipping_id: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare product_id: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare quantity: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare weight: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare length: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare width: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  declare height: number;

  @Column(DataType.FLOAT)
  declare cost?: number;

  @BelongsTo(() => Shipping)
  declare shipping: Shipping;
}

export default ProductItem;