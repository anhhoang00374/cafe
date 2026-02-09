import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db.js';

class Ingredient extends Model {
    declare id: number;
    declare name: string;
    declare unit_id: number;
    declare image: string | null;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Ingredient.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        unit_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'ingredients',
        timestamps: true,
    }
);

export default Ingredient;
