import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db.js';

class Payment extends Model {
    declare id: number;
    declare order_id: number;
    declare amount: number;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Payment.init(
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
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'payments',
        timestamps: true,
    }
);

export default Payment;
