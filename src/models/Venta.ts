import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import SesionCaja from './SesionCaja';
import VentaDetalle from './VentaDetalle';

@Table({
    tableName: 'ventas'
})
class Venta extends Model {
    @ForeignKey(() => SesionCaja)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare sesion_id: number;

    @BelongsTo(() => SesionCaja)
    declare sesion: SesionCaja;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false
    })
    declare total: number;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare metodo_pago: string; // Ej: 'Efectivo', 'Tarjeta', 'QR'

    @Column({
        type: DataType.DATE,
        defaultValue: DataType.NOW
    })
    declare fecha: Date;

    // Relación: Una venta tiene muchos productos desglosados
    @HasMany(() => VentaDetalle)
    declare detalles: VentaDetalle[];
}

export default Venta;