import { sequelize } from './src/models/index.js';

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const [results] = await sequelize.query("SHOW TABLES LIKE 'payments'");
        console.log('Payments table exists:', results.length > 0);

        const [cols] = await sequelize.query("SHOW COLUMNS FROM order_items LIKE 'price_original'");
        console.log('price_original column in order_items exists:', cols.length > 0);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
