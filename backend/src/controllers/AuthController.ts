import { Request, Response, NextFunction } from 'express';
import authService from '../services/AuthService.js';

export class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;
            const result = await authService.login(username, password);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async logout(req: Request, res: Response) {
        res.status(200).json({ message: 'Logged out successfully' });
    }

    async getMe(req: any, res: Response) {
        res.status(200).json({ user: req.user });
    }
}

export default new AuthController();
