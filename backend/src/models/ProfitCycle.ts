import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db.js';

class ProfitCycle extends Model {
    declare id: number;
    declare start_date: Date;
    declare end_date: Date | null;
    declare revenue: number;
    declare cost: number;
    declare profit: number;
    declare status: 'active' | 'closed';
    declare revenue_details: any;
    declare cost_details: any;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

ProfitCycle.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        revenue: {
            type: DataTypes.DECIMAL(14, 2),
            defaultValue: 0,
        },
        cost: {
            type: DataTypes.DECIMAL(14, 2),
            defaultValue: 0,
        },
        profit: {
            type: DataTypes.DECIMAL(14, 2),
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM('active', 'closed'),
            defaultValue: 'active',
        },
        revenue_details: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        cost_details: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'profit_cycles',
        timestamps: true,
    }
);

export default ProfitCycle;
