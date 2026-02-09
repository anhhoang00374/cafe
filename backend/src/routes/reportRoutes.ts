import { Router } from 'express';
import reportController from '../controllers/ReportController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/payments', authenticate, reportController.getPaymentHistory);
router.get('/stats', authenticate, reportController.getStats);

export default router;
