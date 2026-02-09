import { BaseRepository } from './BaseRepository.js';
import Table from '../models/Table.js';

export class TableRepository extends BaseRepository<Table> {
    constructor() {
        super(Table);
    }
}

export default new TableRepository();
