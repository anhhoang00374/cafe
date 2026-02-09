import { Router } from 'express';
import unitController from '../controllers/UnitController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, unitController.getAll);
router.get('/:id', authenticate, unitController.getById);
router.post('/', authenticate, authorize('admin'), unitController.create);
router.put('/:id', authenticate, authorize('admin'), unitController.update);
router.delete('/:id', authenticate, authorize('admin'), unitController.delete);

export default router;
