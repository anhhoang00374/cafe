'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add imported_items_snapshot column to profit_cycles table
        const table = await queryInterface.describeTable('profit_cycles');

        if (!table.imported_items_snapshot) {
            await queryInterface.addColumn('profit_cycles', 'imported_items_snapshot', {
                type: Sequelize.JSON,
                allowNull: true,
            });
        }
    },

    down: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('profit_cycles');

        if (table.imported_items_snapshot) {
            await queryInterface.removeColumn('profit_cycles', 'imported_items_snapshot');
        }
    }
};

