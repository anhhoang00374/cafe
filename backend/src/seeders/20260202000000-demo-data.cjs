'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('admin123', salt);

        // Users
        await queryInterface.bulkInsert('users', [
            {
                username: 'admin',
                password_hash: passwordHash,
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                username: 'staff',
                password_hash: passwordHash,
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        // Categories
        await queryInterface.bulkInsert('categories', [
            { id: 1, name: 'Đồ uống', createdAt: new Date(), updatedAt: new Date() },
            { id: 2, name: 'Đồ ăn', createdAt: new Date(), updatedAt: new Date() },
        ]);

        // Units
        await queryInterface.bulkInsert('units', [
            { id: 1, name: 'Ly', createdAt: new Date(), updatedAt: new Date() },
            { id: 2, name: 'Chai', createdAt: new Date(), updatedAt: new Date() },
            { id: 3, name: 'Phần', createdAt: new Date(), updatedAt: new Date() },
        ]);

        // Products
        await queryInterface.bulkInsert('products', [
            {
                id: 1,
                name: 'Cà phê đen',
                price: 25000,
                category_id: 1,
                unit_id: 1,
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                name: 'Cà phê sữa',
                price: 30000,
                category_id: 1,
                unit_id: 1,
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 3,
                name: 'Bánh mì thịt',
                price: 20000,
                category_id: 2,
                unit_id: 3,
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        // Tables
        await queryInterface.bulkInsert('tables', [
            { table_number: 'T01', name: 'Bàn 1', capacity: 4, status: 'available', createdAt: new Date(), updatedAt: new Date() },
            { table_number: 'T02', name: 'Bàn 2', capacity: 2, status: 'available', createdAt: new Date(), updatedAt: new Date() },
            { table_number: 'T03', name: 'Bàn 3', capacity: 6, status: 'available', createdAt: new Date(), updatedAt: new Date() },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('tables', null, {});
        await queryInterface.bulkDelete('products', null, {});
        await queryInterface.bulkDelete('units', null, {});
        await queryInterface.bulkDelete('categories', null, {});
        await queryInterface.bulkDelete('users', null, {});
    },
};
