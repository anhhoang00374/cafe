import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db.js';

class Unit extends Model {
    declare id: number;
    declare name: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Unit.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: 'units',
        timestamps: true,
    }
);

export default Unit;
