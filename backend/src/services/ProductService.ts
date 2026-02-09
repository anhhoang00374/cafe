import productRepository from '../repositories/ProductRepository.js';

export class ProductService {
    async getAll() {
        return productRepository.findAllWithDetails();
    }

    async getById(id: number) {
        const product = await productRepository.findByIdWithDetails(id);
        if (!product) throw new Error('Product not found');
        return product;
    }

    async create(data: any) {
        return productRepository.create(data);
    }

    async update(id: number, data: any) {
        const product = await this.getById(id);
        return product.update(data);
    }

    async delete(id: number) {
        const product = await this.getById(id);
        return product.destroy();
    }
}

export default new ProductService();
