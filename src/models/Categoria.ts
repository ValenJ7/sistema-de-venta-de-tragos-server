import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Producto from './Producto';
import Negocio from './Negocio';

@Table({
    tableName: 'categorias',
    timestamps: false
})
class Categoria extends Model {
    @Column({
        type: DataType.STRING(50),
        allowNull: false
    })
    declare nombre: string;

    @ForeignKey(() => Negocio)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare negocio_id: number;

    @BelongsTo(() => Negocio)
    declare negocio: Negocio;

    @HasMany(() => Producto)
    declare productos: Producto[];
}

export default Categoria;
