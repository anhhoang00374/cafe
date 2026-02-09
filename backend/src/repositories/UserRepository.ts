import { BaseRepository } from './BaseRepository.js';
import User from '../models/User.js';

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(User);
    }

    async findByUsername(username: string): Promise<User | null> {
        return (this as any).model.findOne({ where: { username } });
    }
}

export default new UserRepository();
