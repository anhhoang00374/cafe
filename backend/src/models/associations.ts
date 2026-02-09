import User from './User.js';
import Category from './Category.js';
import Unit from './Unit.js';
import Product from './Product.js';
import Table from './Table.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Payment from './Payment.js';
import ImportOrder from './ImportOrder.js';
import ImportItem from './ImportItem.js';
import Ingredient from './Ingredient.js';
import ProfitCycle from './ProfitCycle.js';
import InventorySnapshot from './InventorySnapshot.js';

const setupAssociations = () => {
    // Unit - Ingredient
    Unit.hasMany(Ingredient, { foreignKey: 'unit_id', as: 'ingredients' });
    Ingredient.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

    // Category - Product
    Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
    Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

    // Unit - Product
    Unit.hasMany(Product, { foreignKey: 'unit_id', as: 'products' });
    Product.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

    // Table - Order
    Table.hasMany(Order, { foreignKey: 'table_id', as: 'orders' });
    Order.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });

    // Order - OrderItem
    Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
    OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

    // Product - OrderItem
    Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });
    OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

    // Order - Payment
    Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment' });
    Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

    // ImportOrder - ImportItem
    ImportOrder.hasMany(ImportItem, { foreignKey: 'import_order_id', as: 'items' });
    ImportItem.belongsTo(ImportOrder, { foreignKey: 'import_order_id', as: 'import_order' });

    // Ingredient - ImportItem
    Ingredient.hasMany(ImportItem, { foreignKey: 'ingredient_id', as: 'import_items' });
    ImportItem.belongsTo(Ingredient, { foreignKey: 'ingredient_id', as: 'ingredient' });

    // Product - InventorySnapshot
    Product.hasOne(InventorySnapshot, { foreignKey: 'product_id', as: 'inventory' });
    InventorySnapshot.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
};

export default setupAssociations;
