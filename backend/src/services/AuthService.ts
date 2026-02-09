import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userRepository from '../repositories/UserRepository.js';
import User from '../models/User.js';

export class AuthService {
    async login(username: string, password: string) {
        const user = await userRepository.findByUsername(username);

        if (!user) {
            throw new Error('Invalid username or password');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid username or password');
        }

        const token = this.generateToken(user);

        return {
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
            token,
        };
    }

    generateToken(user: User): string {
        return jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
        );
    }
}

export default new AuthService();
