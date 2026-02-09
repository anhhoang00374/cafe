import { Router } from 'express';
import productController from '../controllers/ProductController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.get('/', authenticate, productController.getAll);
router.get('/:id', authenticate, productController.getById);
router.post('/', authenticate, authorize('admin'), upload.single('image'), productController.create);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), productController.update);
router.delete('/:id', authenticate, authorize('admin'), productController.delete);

export default router;
