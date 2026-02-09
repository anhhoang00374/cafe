import { Router } from 'express';
import profitController from '../controllers/ProfitController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, profitController.getAllCycles);
router.get('/:id', authenticate, profitController.getCycleDetails);
router.post('/calculate', authenticate, profitController.calculateProfitCycle);
router.delete('/:id', authenticate, profitController.deleteCycle);

export default router;
