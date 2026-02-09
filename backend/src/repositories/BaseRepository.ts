import { Model, ModelStatic, FindOptions, UpdateOptions, DestroyOptions } from 'sequelize';

export class BaseRepository<T extends Model> {
    protected model: ModelStatic<T>;

    constructor(model: ModelStatic<T>) {
        this.model = model;
    }

    async findAll(options?: FindOptions): Promise<T[]> {
        return this.model.findAll(options);
    }

    async findById(id: number | string, options?: FindOptions): Promise<T | null> {
        return this.model.findByPk(id, options);
    }

    async findOne(options: FindOptions): Promise<T | null> {
        return this.model.findOne(options);
    }

    async create(data: any, options?: any): Promise<T> {
        return (this.model as any).create(data, options);
    }

    async update(data: any, options: UpdateOptions): Promise<[number]> {
        return this.model.update(data, options);
    }

    async delete(options: DestroyOptions): Promise<number> {
        return this.model.destroy(options);
    }

    async count(options?: FindOptions): Promise<number> {
        return this.model.count(options);
    }
}
