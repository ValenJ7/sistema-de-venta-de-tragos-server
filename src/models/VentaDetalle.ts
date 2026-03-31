import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Venta from './Venta';
import Producto from './Producto';

@Table({
    tableName: 'venta_detalles',
    timestamps: false // No solemos necesitar updatedAt aquí
})
class VentaDetalle extends Model {
    @ForeignKey(() => Venta)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare venta_id: number;

    @BelongsTo(() => Venta)
    declare venta: Venta;

    @ForeignKey(() => Producto)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare producto_id: number;

    @BelongsTo(() => Producto)
    declare producto: Producto;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare cantidad: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false
    })
    declare precio_unitario: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false
    })
    declare subtotal: number;
}

export default VentaDetalle;