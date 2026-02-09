import { BaseRepository } from './BaseRepository.js';
import Category from '../models/Category.js';

export class CategoryRepository extends BaseRepository<Category> {
    constructor() {
        super(Category);
    }
}

export default new CategoryRepository();
