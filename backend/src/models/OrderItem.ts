import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db.js';

class OrderItem extends Model {
    declare id: number;
    declare order_id: number;
    declare product_id: number;
    declare qty: number;
    declare price_original: number;
    declare price_snapshot: number;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

OrderItem.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        order_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        qty: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        price_original: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        price_snapshot: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'order_items',
        timestamps: true,
    }
);

export default OrderItem;
