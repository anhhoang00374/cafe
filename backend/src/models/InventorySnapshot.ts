import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db.js';

class InventorySnapshot extends Model {
    declare id: number;
    declare product_id: number;
    declare qty: number;
    declare last_cost_price: number;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

InventorySnapshot.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        product_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            unique: true,
        },
        qty: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        last_cost_price: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'inventory_snapshots',
        timestamps: true,
    }
);

export default InventorySnapshot;
