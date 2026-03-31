import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Negocio from './Negocio';
import SesionCaja from './SesionCaja';

@Table({
    tableName: 'cajas'
})
class Caja extends Model {
    @Column({
        type: DataType.STRING(50),
        allowNull: false
    })
    declare nombre: string;

    @Column({
        type: DataType.ENUM('ABIERTA', 'CERRADA'),
        defaultValue: 'CERRADA'
    })
    declare estado: string;

    @ForeignKey(() => Negocio)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare negocio_id: number;

    @BelongsTo(() => Negocio, { onDelete: 'CASCADE' })
    declare negocio: Negocio;

    @HasMany(() => SesionCaja)
    declare sesiones: SesionCaja[];
}

export default Caja;