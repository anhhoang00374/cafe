import categoryRepository from '../repositories/CategoryRepository.js';

export class CategoryService {
    async getAll() {
        return categoryRepository.findAll();
    }

    async getById(id: number) {
        const category = await categoryRepository.findById(id);
        if (!category) throw new Error('Category not found');
        return category;
    }

    async create(data: any) {
        return categoryRepository.create(data);
    }

    async update(id: number, data: any) {
        const category = await this.getById(id);
        return category.update(data);
    }

    async delete(id: number) {
        const category = await this.getById(id);
        return category.destroy();
    }
}

export default new CategoryService();
