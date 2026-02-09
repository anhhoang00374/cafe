import { Router } from 'express';
import categoryController from '../controllers/CategoryController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, categoryController.getAll);
router.get('/:id', authenticate, categoryController.getById);
router.post('/', authenticate, authorize('admin'), categoryController.create);
router.put('/:id', authenticate, authorize('admin'), categoryController.update);
router.delete('/:id', authenticate, authorize('admin'), categoryController.delete);

export default router;
