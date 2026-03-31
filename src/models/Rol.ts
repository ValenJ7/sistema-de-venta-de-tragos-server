import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import Usuario from './Usuario';

@Table({
    tableName: 'roles',
    timestamps: false
})
class Rol extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare nombre: string;

    @HasMany(() => Usuario)
    declare usuarios: Usuario[];
}

export default Rol;