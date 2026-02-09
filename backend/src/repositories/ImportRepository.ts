import { BaseRepository } from './BaseRepository.js';
import ImportOrder from '../models/ImportOrder.js';
import ImportItem from '../models/ImportItem.js';
import Ingredient from '../models/Ingredient.js';
import Unit from '../models/Unit.js';

export class ImportRepository extends BaseRepository<ImportOrder> {
    constructor() {
        super(ImportOrder);
    }

    async findAllWithDetails() {
        return (this as any).model.findAll({
            include: [
                {
                    model: ImportItem,
                    as: 'items',
                    include: [
                        {
                            model: Ingredient,
                            as: 'ingredient',
                            include: [{ model: Unit, as: 'unit' }]
                        }
                    ]
                }
            ],
            order: [['date', 'DESC']]
        });
    }

    async findWithDetails(id: number) {
        return (this as any).model.findByPk(id, {
            include: [
                {
                    model: ImportItem,
                    as: 'items',
                    include: [
                        {
                            model: Ingredient,
                            as: 'ingredient',
                            include: [{ model: Unit, as: 'unit' }]
                        }
                    ]
                }
            ]
        });
    }
}

export default new ImportRepository();
