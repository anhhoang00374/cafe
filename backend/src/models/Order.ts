import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db.js';

class Order extends Model {
    declare id: number;
    declare table_id: number | null;
    declare table_name: string | null;
    declare daily_seq: number;
    declare customer_name: string | null;
    declare guest_count: number;
    declare status: 'pending' | 'completed' | 'cancelled';
    declare total: number;
    declare discount: number;
    declare final_total: number;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Order.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        table_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        table_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        daily_seq: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        customer_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        guest_count: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
            defaultValue: 'pending',
        },
        total: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0,
        },
        discount: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0,
        },
        final_total: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'orders',
        timestamps: true,
    }
);

export default Order;
