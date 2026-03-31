import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import Usuario from './Usuario';
import Caja from './Caja';

@Table({
    tableName: 'negocios'
})
class Negocio extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare nombre: string;

    @Column({
        type: DataType.STRING
    })
    declare config_moneda: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
        allowNull: false
    })
    declare activo: boolean;

    @HasMany(() => Usuario, { onDelete: 'CASCADE' })
    declare usuarios: Usuario[];

    @HasMany(() => Caja, { onDelete: 'CASCADE' })
    declare cajas: Caja[];
}

export default Negocio;