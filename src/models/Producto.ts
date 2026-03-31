import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Categoria from './Categoria';
import Negocio from './Negocio';

@Table({
    tableName: 'productos'
})
class Producto extends Model {
    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    declare nombre: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false
    })
    declare precio: number;

    @ForeignKey(() => Categoria)
    @Column({
        type: DataType.INTEGER
    })
    declare categoria_id: number;

    @BelongsTo(() => Categoria)
    declare categoria: Categoria;

    @ForeignKey(() => Negocio)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare negocio_id: number;

    @BelongsTo(() => Negocio)
    declare negocio: Negocio;
}

export default Producto;
