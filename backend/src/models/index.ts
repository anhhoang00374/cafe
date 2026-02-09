import { sequelize } from './db.js';
import setupAssociations from './associations.js';

// Initialize all model associations
setupAssociations();

export { sequelize };
export default sequelize;
