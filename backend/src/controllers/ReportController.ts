import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import sequelize from '../models/index.js';

export class ReportController {

    // Helper to get date range from query
    private getDateRange = (req: Request): { start: Date, end: Date } => {
        const { startDate, endDate, range } = req.query;
        let start = new Date();
        let end = new Date();

        if (startDate && endDate) {
            start = new Date(startDate as string);
            end = new Date(endDate as string);
            // Ensure end date includes the full day
            end.setHours(23, 59, 59, 999);
        } else if (range === 'weekly') {
            start.setDate(end.getDate() - 7);
            start.setHours(0, 0, 0, 0);
        } else if (range === 'monthly') {
            start.setMonth(end.getMonth() - 1);
            start.setHours(0, 0, 0, 0);
        } else {
            // Default to today
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }

        return { start, end };
    }

    getPaymentHistory = async (req: Request, res: Response) => {
        try {
            const { start, end } = this.getDateRange(req);

            const payments = await Payment.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [start, end]
                    }
                },
                include: [{
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'daily_seq', 'customer_name', 'table_name', 'total', 'discount']
                }],
                order: [['createdAt', 'DESC']]
            });

            res.json(payments);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    getStats = async (req: Request, res: Response) => {
        try {
            const { start, end } = this.getDateRange(req);

            // 1. Basic Payments Stats within range
            const payments = await Payment.findAll({
                where: {
                    createdAt: { [Op.between]: [start, end] }
                },
                include: [{
                    model: Order,
                    as: 'order',
                    include: [{
                        model: OrderItem,
                        as: 'items',
                        include: [{ model: Product, as: 'product' }]
                    }]
                }]
            });

            const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
            const totalOrders = payments.length;
            const totalDiscount = payments.reduce((sum, p: any) => sum + Number(p.order?.discount || 0), 0);

            // 2. Item Analysis (Trending & Sales Breakdown)
            const itemMap = new Map<string, { id: number, name: string, qty: number, revenue: number }>();

            payments.forEach((p: any) => {
                if (p.order && p.order.items) {
                    p.order.items.forEach((item: any) => {
                        const key = item.product_id;
                        const existing = itemMap.get(key) || {
                            id: item.product_id,
                            name: item.product?.name || 'Unknown',
                            qty: 0,
                            revenue: 0
                        };

                        existing.qty += item.qty;
                        existing.revenue += Number(item.price_snapshot) * item.qty;
                        itemMap.set(key, existing);
                    });
                }
            });

            const allItems = Array.from(itemMap.values());

            // Trending: Sort by quantity sold
            const trending = [...allItems].sort((a, b) => b.qty - a.qty).slice(0, 10);

            // Sales Report: Sort by revenue
            const salesReport = [...allItems].sort((a, b) => b.revenue - a.revenue);

            // 3. Chart Data (Revenue over time)
            // Group by day for ranges > 2 days, else group by hour
            const diffDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
            const chartData: Record<string, number> = {};

            payments.forEach(p => {
                const date = new Date(p.createdAt);
                let key;
                if (diffDays <= 2) {
                    // Hourly
                    key = `${date.getHours()}:00`;
                } else {
                    // Daily
                    key = `${date.getDate()}/${date.getMonth() + 1}`;
                }
                chartData[key] = (chartData[key] || 0) + Number(p.amount);
            });

            res.json({
                overview: {
                    totalRevenue,
                    totalOrders,
                    totalDiscount
                },
                trending,
                salesByItem: salesReport,
                chartData: Object.entries(chartData).map(([label, value]) => ({ label, value })),
                dateRange: { start, end }
            });

        } catch (error: any) {
            console.error('Report Error:', error);
            res.status(500).json({ message: error.message });
        }
    }
}

export default new ReportController();
