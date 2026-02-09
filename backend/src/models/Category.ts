import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db.js';

class Category extends Model {
    declare id: number;
    declare name: string;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Category.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: 'categories',
        timestamps: true,
    }
);

export default Category;
