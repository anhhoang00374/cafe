import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db.js';

class ImportOrder extends Model {
    declare id: number;
    declare date: Date;
    declare supplier: string | null;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

ImportOrder.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        supplier: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'import_orders',
        timestamps: true,
    }
);

export default ImportOrder;
