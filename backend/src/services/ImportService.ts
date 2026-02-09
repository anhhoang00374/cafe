import importRepository from '../repositories/ImportRepository.js';
import ImportItem from '../models/ImportItem.js';
import InventorySnapshot from '../models/InventorySnapshot.js';
import { sequelize } from '../models/index.js';

export class ImportService {
    async getAll() {
        return importRepository.findAllWithDetails();
    }

    async createImport(date: Date, supplier: string, items: any[]) {
        const transaction = await sequelize.transaction();
        try {
            const importOrder = await importRepository.create({ date, supplier }, { transaction });

            for (const item of items) {
                console.log(`Creating ImportItem: ingredient=${item.ingredient_id}, qty=${item.qty}`);
                await ImportItem.create({
                    import_order_id: importOrder.id,
                    ingredient_id: item.ingredient_id,
                    qty: item.qty,
                    remaining_qty: item.qty, // Initially same as qty
                    cost_price: item.cost_price
                }, { transaction });
            }

            await transaction.commit();
            return importRepository.findWithDetails(importOrder.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateItem(itemId: number, remaining_qty: number, cost_price?: number) {
        const item = await ImportItem.findByPk(itemId);
        if (!item) throw new Error('Import item not found');

        const updateData: any = { remaining_qty };
        if (cost_price !== undefined) {
            updateData.cost_price = cost_price;
        }

        return item.update(updateData);
    }
}

export default new ImportService();
