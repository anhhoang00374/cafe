'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add missing columns to profit_cycles table
        const table = await queryInterface.describeTable('profit_cycles');

        if (!table.revenue_details) {
            await queryInterface.addColumn('profit_cycles', 'revenue_details', {
                type: Sequelize.JSON,
                allowNull: true,
            });
        }

        if (!table.cost_details) {
            await queryInterface.addColumn('profit_cycles', 'cost_details', {
                type: Sequelize.JSON,
                allowNull: true,
            });
        }

        // Add missing columns to profit_cycles table
        if (!table.status) {
            await queryInterface.addColumn('profit_cycles', 'status', {
                type: Sequelize.ENUM('active', 'closed'),
                defaultValue: 'active',
            });
        }

        // Update end_date to be nullable
        if (table.end_date && !table.end_date.allowNull) {
            await queryInterface.changeColumn('profit_cycles', 'end_date', {
                type: Sequelize.DATE,
                allowNull: true,
            });
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Revert changes
        const table = await queryInterface.describeTable('profit_cycles');

        if (table.revenue_details) {
            await queryInterface.removeColumn('profit_cycles', 'revenue_details');
        }

        if (table.cost_details) {
            await queryInterface.removeColumn('profit_cycles', 'cost_details');
        }

        if (table.status) {
            await queryInterface.removeColumn('profit_cycles', 'status');
        }

        if (table.end_date && table.end_date.allowNull) {
            await queryInterface.changeColumn('profit_cycles', 'end_date', {
                type: Sequelize.DATE,
                allowNull: false,
            });
        }
    }
};

