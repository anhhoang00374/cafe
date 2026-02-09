'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Users table
        await queryInterface.createTable('users', {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
            username: { type: Sequelize.STRING(50), allowNull: false, unique: true },
            password_hash: { type: Sequelize.STRING(255), allowNull: false },
            role: { type: Sequelize.ENUM('admin', 'user'), defaultValue: 'user' },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        // Units table
        await queryInterface.createTable('units', {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
            name: { type: Sequelize.STRING(50), allowNull: false, unique: true },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        // Categories table
        await queryInterface.createTable('categories', {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
            name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        // Products table
        await queryInterface.createTable('products', {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
            name: { type: Sequelize.STRING(255), allowNull: false },
            price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            promo_price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
            image: { type: Sequelize.STRING(255), allowNull: true },
            category_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'categories', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            unit_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'units', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            active: { type: Sequelize.BOOLEAN, defaultValue: true },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        // Tables table
        await queryInterface.createTable('tables', {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
            table_number: { type: Sequelize.STRING(20), allowNull: false, unique: true },
            name: { type: Sequelize.STRING(100), allowNull: false },
            position: { type: Sequelize.STRING(100), allowNull: true },
            capacity: { type: Sequelize.INTEGER, defaultValue: 1 },
            status: { type: Sequelize.ENUM('available', 'occupied', 'reserved', 'out_of_service'), defaultValue: 'available' },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        // Orders table
        await queryInterface.createTable('orders', {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
            table_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true,
                references: { model: 'tables', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            status: { type: Sequelize.ENUM('pending', 'completed', 'cancelled'), defaultValue: 'pending' },
            total: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
            discount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
            final_total: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        // OrderItems table
        await queryInterface.createTable('order_items', {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
            order_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'orders', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            qty: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            price_snapshot: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        // Payments table
        await queryInterface.createTable('payments', {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
            order_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                unique: true,
                references: { model: 'orders', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        // ImportOrders table
        await queryInterface.createTable('import_orders', {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
            date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        // ImportItems table
        await queryInterface.createTable('import_items', {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
            import_order_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'import_orders', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            qty: { type: Sequelize.INTEGER, allowNull: false },
            cost_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        // ProfitCycles table
        await queryInterface.createTable('profit_cycles', {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
            start_date: { type: Sequelize.DATE, allowNull: false },
            end_date: { type: Sequelize.DATE, allowNull: false },
            revenue: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            cost: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            profit: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });

        // InventorySnapshots table
        await queryInterface.createTable('inventory_snapshots', {
            id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
            product_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                unique: true,
                references: { model: 'products', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            remaining_qty: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('inventory_snapshots');
        await queryInterface.dropTable('profit_cycles');
        await queryInterface.dropTable('import_items');
        await queryInterface.dropTable('import_orders');
        await queryInterface.dropTable('payments');
        await queryInterface.dropTable('order_items');
        await queryInterface.dropTable('orders');
        await queryInterface.dropTable('tables');
        await queryInterface.dropTable('products');
        await queryInterface.dropTable('categories');
        await queryInterface.dropTable('units');
        await queryInterface.dropTable('users');
    }
};
