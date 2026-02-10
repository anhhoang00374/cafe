import { sequelize } from './db.js';

// Import all models to register them
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

import setupAssociations from './associations.js';

// Initialize all model associations
setupAssociations();

export { sequelize };
export default sequelize;
