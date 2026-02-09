import { Router } from 'express';
import ingredientController from '../controllers/IngredientController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.get('/', authenticate, ingredientController.getAll);
router.get('/:id', authenticate, ingredientController.getById);
router.post('/', authenticate, authorize('admin'), upload.single('image'), ingredientController.create);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), ingredientController.update);
router.delete('/:id', authenticate, authorize('admin'), ingredientController.delete);

export default router;
