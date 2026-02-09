import unitRepository from '../repositories/UnitRepository.js';

export class UnitService {
    async getAll() {
        return unitRepository.findAll();
    }

    async getById(id: number) {
        const unit = await unitRepository.findById(id);
        if (!unit) throw new Error('Unit not found');
        return unit;
    }

    async create(data: any) {
        return unitRepository.create(data);
    }

    async update(id: number, data: any) {
        const unit = await this.getById(id);
        return unit.update(data);
    }

    async delete(id: number) {
        const unit = await this.getById(id);
        return unit.destroy();
    }
}

export default new UnitService();
