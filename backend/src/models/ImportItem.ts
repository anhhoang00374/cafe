import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db.js';

class ImportItem extends Model {
    declare id: number;
    declare import_order_id: number;
    declare ingredient_id: number;
    declare qty: number;
    declare remaining_qty: number;
    declare cost_price: number;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

ImportItem.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        import_order_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        ingredient_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        qty: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        remaining_qty: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        cost_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'import_items',
        timestamps: true,
    }
);

export default ImportItem;
