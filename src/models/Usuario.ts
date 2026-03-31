import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Rol from './Rol';
import Negocio from './Negocio';

@Table({
    tableName: 'usuarios'
})
class Usuario extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare nombre: string;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare password_hash: string;

    @ForeignKey(() => Rol)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare rol_id: number;

    @BelongsTo(() => Rol)
    declare rol: Rol;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true
    })
    declare activo: boolean;

    @ForeignKey(() => Negocio)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare negocio_id: number;

    @BelongsTo(() => Negocio, { onDelete: 'CASCADE' })
    declare negocio: Negocio;

    @Column({ type: DataType.STRING, allowNull: true })
    declare reset_token: string;

    @Column({ type: DataType.DATE, allowNull: true })
    declare reset_token_expiry: Date;
}

export default Usuario;