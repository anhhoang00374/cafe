import { BaseRepository } from './BaseRepository.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Unit from '../models/Unit.js';

export class ProductRepository extends BaseRepository<Product> {
    constructor() {
        super(Product);
    }

    async findAllWithDetails() {
        return (this as any).model.findAll({
            include: [
                { model: Category, as: 'category' },
                { model: Unit, as: 'unit' },
            ],
        });
    }

    async findByIdWithDetails(id: number) {
        return (this as any).model.findByPk(id, {
            include: [
                { model: Category, as: 'category' },
                { model: Unit, as: 'unit' },
            ],
        });
    }
}

export default new ProductRepository();
