import tableRepository from '../repositories/TableRepository.js';

export class TableService {
    async getAll() {
        return tableRepository.findAll();
    }

    async getById(id: number) {
        const table = await tableRepository.findById(id);
        if (!table) throw new Error('Table not found');
        return table;
    }

    async create(data: any) {
        return tableRepository.create(data);
    }

    async update(id: number, data: any) {
        const table = await this.getById(id);
        return table.update(data);
    }

    async delete(id: number) {
        const table = await this.getById(id);
        return table.destroy();
    }
}

export default new TableService();
