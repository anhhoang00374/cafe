import { BaseRepository } from './BaseRepository.js';
import Unit from '../models/Unit.js';

export class UnitRepository extends BaseRepository<Unit> {
    constructor() {
        super(Unit);
    }
}

export default new UnitRepository();
