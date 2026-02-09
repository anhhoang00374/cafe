import { Router } from 'express';
import tableController from '../controllers/TableController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, tableController.getAll);
router.get('/:id', authenticate, tableController.getById);
router.post('/', authenticate, authorize('admin'), tableController.create);
router.put('/:id', authenticate, authorize('admin'), tableController.update);
router.delete('/:id', authenticate, authorize('admin'), tableController.delete);

export default router;
