import { Op } from 'sequelize';
import { BaseRepository } from './BaseRepository.js';
import { sequelize } from '../models/db.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import Table from '../models/Table.js';
import Payment from '../models/Payment.js';

export class OrderRepository extends BaseRepository<Order> {
    constructor() {
        super(Order);
    }

    async findWithDetails(id: number) {
        return this.model.findByPk(id, {
            include: [
                { model: Table, as: 'table' },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                },
                { model: Payment, as: 'payment' }
            ],
        });
    }

    async findActiveByTable(table_id: number) {
        return this.model.findOne({
            where: { table_id, status: 'pending' },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });
    }

    async findAllToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.model.findAll({
            where: {
                [Op.or]: [
                    { status: { [Op.in]: ['pending', 'served'] } },
                    { createdAt: { [Op.gte]: today } }
                ]
            },
            include: [
                { model: Table, as: 'table' },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                },
                { model: Payment, as: 'payment' }
            ],
            order: [
                // Unpaid (pending/served) first, then completed/cancelled
                [sequelize.literal("CASE WHEN `Order`.status IN ('pending','served') THEN 0 ELSE 1 END"), 'ASC'],
                // Within each group, oldest first
                ['createdAt', 'ASC']
            ]
        });
    }

    async getLastDailySeq() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const last = await this.model.findOne({
            where: {
                createdAt: { [Op.gte]: today }
            },
            order: [['daily_seq', 'DESC']]
        });
        return last ? last.daily_seq : 0;
    }
}

export default new OrderRepository();
