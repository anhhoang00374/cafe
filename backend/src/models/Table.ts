import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db.js';

class Table extends Model {
    declare id: number;
    declare table_number: string;
    declare name: string;
    declare position: string | null;
    declare capacity: number;
    declare status: 'available' | 'occupied' | 'reserved' | 'out_of_service';

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Table.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        table_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        position: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        capacity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        status: {
            type: DataTypes.ENUM('available', 'occupied', 'reserved', 'out_of_service'),
            defaultValue: 'available',
        },
    },
    {
        sequelize,
        tableName: 'tables',
        timestamps: true,
    }
);

export default Table;
