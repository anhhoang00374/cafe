import { Router } from 'express';
import authController from '../controllers/AuthController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
