import paymentRepository from '../repositories/PaymentRepository.js';
import orderRepository from '../repositories/OrderRepository.js';
import { sequelize } from '../models/index.js';

export class PaymentService {
    async processPayment(order_id: number, amount: number) {
        const transaction = await sequelize.transaction();
        try {
            const order = await orderRepository.findById(order_id, { transaction });
            if (!order) throw new Error('Order not found');

            if (order.status !== 'completed') {
                throw new Error('Order must be completed before payment');
            }

            const payment = await paymentRepository.create({
                order_id,
                amount
            }, { transaction });

            await transaction.commit();
            return payment;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

export default new PaymentService();
