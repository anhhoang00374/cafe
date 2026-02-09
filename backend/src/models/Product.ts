import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db.js';

class Product extends Model {
    declare id: number;
    declare name: string;
    declare price: number;
    declare promo_price: number | null;
    declare image: string | null;
    declare category_id: number;
    declare unit_id: number;
    declare active: boolean;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Product.init(
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
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        promo_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        category_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        unit_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'products',
        timestamps: true,
    }
);

export default Product;
