import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Caja from './Caja';
import Usuario from './Usuario';
import Venta from './Venta';

@Table({
    tableName: 'sesiones_caja'
})
class SesionCaja extends Model {
    @ForeignKey(() => Caja)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare caja_id: number;

    @BelongsTo(() => Caja)
    declare caja: Caja;

    @ForeignKey(() => Usuario)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare usuario_id: number;

    @BelongsTo(() => Usuario)
    declare usuario: Usuario;

    @Column({
        type: DataType.DATE,
        defaultValue: DataType.NOW
    })
    declare apertura_fecha: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare cierre_fecha: Date;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false
    })
    declare monto_inicial: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: true
    })
    declare monto_final_real: number;

    @HasMany(() => Venta)
    declare ventas: Venta[];
}

export default SesionCaja;