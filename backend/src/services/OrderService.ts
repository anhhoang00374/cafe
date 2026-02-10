import orderRepository from '../repositories/OrderRepository.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import Table from '../models/Table.js';
import Payment from '../models/Payment.js';
import { sequelize } from '../models/index.js';

export class OrderService {
    async getOrdersToday() {
        return orderRepository.findAllToday();
    }

    async getById(id: number) {
        return orderRepository.findWithDetails(id);
    }

    async create(data: { table_id?: number, table_name?: string, customer_name?: string, guest_count?: number }) {
        const lastSeq = await orderRepository.getLastDailySeq();
        const newSeq = lastSeq + 1;

        if (data.table_id) {
            const existing = await orderRepository.findActiveByTable(data.table_id);
            if (existing) throw new Error('Table is already occupied');

            const table = await Table.findByPk(data.table_id);
            if (table) {
                await table.update({ status: 'occupied' });
            }
        }

        return orderRepository.create({
            ...data,
            daily_seq: newSeq,
            status: 'pending'
        });
    }

    async update(id: number, data: any) {
        const order = await orderRepository.findById(id);
        if (!order) throw new Error('Order not found');
        return order.update(data);
    }

    async addItem(order_id: number, product_id: number, qty: number) {
        const transaction = await sequelize.transaction();
        try {
            const product = await Product.findByPk(product_id);
            if (!product) throw new Error('Product not found');

            const existingItem = await OrderItem.findOne({ where: { order_id, product_id }, transaction });

            if (existingItem) {
                await existingItem.update({ qty: existingItem.qty + qty }, { transaction });
            } else {
                await OrderItem.create({
                    order_id,
                    product_id,
                    qty,
                    price_original: product.price,
                    price_snapshot: product.promo_price || product.price
                }, { transaction });
            }

            await this.calculateTotals(order_id, transaction);
            await transaction.commit();
            return orderRepository.findWithDetails(order_id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateItemQty(item_id: number, qty: number) {
        const item = await OrderItem.findByPk(item_id);
        if (!item) throw new Error('Item not found');

        const transaction = await sequelize.transaction();
        try {
            if (qty <= 0) {
                await item.destroy({ transaction });
            } else {
                await item.update({ qty }, { transaction });
            }
            await this.calculateTotals(item.order_id, transaction);
            await transaction.commit();
            return orderRepository.findWithDetails(item.order_id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async calculateTotals(order_id: number, transaction?: any) {
        const order = await orderRepository.findById(order_id, { transaction });
        if (!order) return;

        const items = await OrderItem.findAll({ where: { order_id }, transaction });
        const merchandise_total = items.reduce((sum, item) => sum + (Number(item.price_original) * item.qty), 0);
        const promo_discount = items.reduce((sum, item) => sum + (Number(item.price_original) - Number(item.price_snapshot)) * item.qty, 0);

        // Keep current manual discount if exists, or just use promo_discount
        // Usually discount field on Order should capture the sum of all price reductions
        const final_total = merchandise_total - promo_discount;
        await order.update({ total: merchandise_total, discount: promo_discount, final_total }, { transaction });
    }

    async completeOrder(order_id: number, manual_discount: number = 0) {
        const transaction = await sequelize.transaction();
        try {
            console.log('[OrderService] Finding order:', order_id);
            const order = await orderRepository.findById(order_id, { transaction });
            if (!order) throw new Error('Order not found');
            console.log('[OrderService] Order found, status:', order.status, 'total:', order.total);

            const currentPromoDiscount = Number(order.discount || 0);
            const totalDiscount = currentPromoDiscount + manual_discount;
            const finalTotal = Number(order.total) - totalDiscount;
            console.log('[OrderService] Calculated: promoDiscount=', currentPromoDiscount, 'totalDiscount=', totalDiscount, 'finalTotal=', finalTotal);

            await order.update({
                status: 'completed',
                discount: totalDiscount,
                final_total: finalTotal
            }, { transaction });
            console.log('[OrderService] Order updated');

            // Record payment
            console.log('[OrderService] Creating payment record...');
            await Payment.create({
                order_id: order.id,
                amount: finalTotal
            }, { transaction });
            console.log('[OrderService] Payment created');

            if (order.table_id) {
                const table = await Table.findByPk(order.table_id, { transaction });
                if (table) {
                    await table.update({ status: 'available' }, { transaction });
                }
            }

            await transaction.commit();
            console.log('[OrderService] Transaction committed');
            return orderRepository.findWithDetails(order_id);
        } catch (error) {
            console.error('[OrderService] Error in completeOrder:', error);
            if (transaction) await transaction.rollback();
            throw error;
        }
    }
    async markAsServed(order_id: number) {
        const order = await orderRepository.findById(order_id);
        if (!order) throw new Error('Order not found');
        return order.update({ status: 'served' });
    }

    async cancelOrder(order_id: number) {
        const transaction = await sequelize.transaction();
        try {
            const order = await orderRepository.findById(order_id, { transaction });
            if (!order) throw new Error('Order not found');

            await order.update({ status: 'cancelled' }, { transaction });

            if (order.table_id) {
                const table = await Table.findByPk(order.table_id, { transaction });
                if (table) {
                    await table.update({ status: 'available' }, { transaction });
                }
            }

            await transaction.commit();
            return order;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

export default new OrderService();
