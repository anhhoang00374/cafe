import { Router } from 'express';
import importController from '../controllers/ImportController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, importController.getAll);
router.post('/', authenticate, authorize('admin'), importController.create);
router.patch('/items/:id/stock', authenticate, authorize('admin'), importController.updateItemStock);

export default router;
