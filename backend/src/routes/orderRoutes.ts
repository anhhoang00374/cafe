import { Router } from 'express';
import orderController from '../controllers/OrderController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, orderController.getAllToday);
router.post('/', authenticate, orderController.create);
router.get('/:id', authenticate, orderController.getById);
router.put('/:id', authenticate, orderController.update);
router.post('/:id/items', authenticate, orderController.addItem);
router.put('/items/:itemId', authenticate, orderController.updateItemQty);
router.post('/:id/complete', authenticate, orderController.completeOrder);
router.post('/:id/served', authenticate, orderController.markServed);
router.post('/:id/cancel', authenticate, orderController.cancelOrder);

export default router;
