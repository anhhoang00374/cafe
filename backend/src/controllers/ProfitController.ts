import { Request, Response } from 'express';
import { Op } from 'sequelize';
import ProfitCycle from '../models/ProfitCycle.js';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import ImportItem from '../models/ImportItem.js';
import ImportOrder from '../models/ImportOrder.js';
import Ingredient from '../models/Ingredient.js';

export class ProfitController {

    // Get all profit cycles
    getAllCycles = async (req: Request, res: Response) => {
        try {
            const cycles = await ProfitCycle.findAll({
                order: [['createdAt', 'DESC']]
            });
            res.json(cycles);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get single cycle details
    getCycleDetails = async (req: Request, res: Response) => {
        try {
            const cycle = await ProfitCycle.findByPk(req.params.id);
            if (!cycle) {
                return res.status(404).json({ message: 'Không tìm thấy chu kỳ' });
            }
            res.json(cycle);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    // Calculate and close a profit cycle
    calculateProfitCycle = async (req: Request, res: Response) => {
        try {
            const now = new Date();

            // Find the last closed cycle to determine start date
            const lastCycle = await ProfitCycle.findOne({
                where: { status: 'closed' },
                order: [['end_date', 'DESC']]
            });

            const startDate = lastCycle ? new Date(lastCycle.end_date!) : new Date(0); // From epoch if no previous cycle
            const endDate = now;

            // ============ REVENUE CALCULATION ============
            // Get all payments in this period
            const payments = await Payment.findAll({
                where: {
                    createdAt: { [Op.between]: [startDate, endDate] }
                },
                include: [{
                    model: Order,
                    as: 'order',
                    include: [{
                        model: OrderItem,
                        as: 'items',
                        include: [{ model: Product, as: 'product' }]
                    }]
                }],
                order: [['createdAt', 'DESC']]
            });

            let totalRevenue = 0;
            const revenueItems: any[] = [];
            const ordersSummary: any[] = [];

            payments.forEach((p: any) => {
                totalRevenue += Number(p.amount);

                if (p.order) {
                    const orderData: any = {
                        orderId: p.order.id,
                        dailySeq: p.order.daily_seq,
                        tableName: p.order.table_name || 'Mang về',
                        customerName: p.order.customer_name || 'Khách vãng lai',
                        total: Number(p.amount),
                        createdAt: p.createdAt,
                        items: []
                    };

                    if (p.order.items) {
                        p.order.items.forEach((item: any) => {
                            const itemTotal = Number(item.price_snapshot) * item.qty;
                            orderData.items.push({
                                productId: item.product_id,
                                productName: item.product?.name || 'Unknown',
                                qty: item.qty,
                                unitPrice: Number(item.price_snapshot),
                                total: itemTotal
                            });

                            // Aggregate revenue items
                            const existing = revenueItems.find(r => r.productId === item.product_id);
                            if (existing) {
                                existing.qty += item.qty;
                                existing.total += itemTotal;
                            } else {
                                revenueItems.push({
                                    productId: item.product_id,
                                    productName: item.product?.name || 'Unknown',
                                    qty: item.qty,
                                    unitPrice: Number(item.price_snapshot),
                                    total: itemTotal
                                });
                            }
                        });
                    }
                    ordersSummary.push(orderData);
                }
            });

            // ============ COST CALCULATION ============
            // Get all import items and calculate consumption based on remaining_qty vs qty
            const importItems = await ImportItem.findAll({
                include: [
                    { model: Ingredient, as: 'ingredient' },
                    { model: ImportOrder, as: 'import_order' }
                ]
            });

            let totalCost = 0;
            const costDetails: any[] = [];

            importItems.forEach((item: any) => {
                const consumed = Number(item.qty) - Number(item.remaining_qty);
                if (consumed > 0) {
                    const costForItem = consumed * Number(item.cost_price);
                    totalCost += costForItem;

                    costDetails.push({
                        importItemId: item.id,
                        importOrderId: item.import_order_id,
                        ingredientId: item.ingredient_id,
                        ingredientName: item.ingredient?.name || 'Unknown',
                        importDate: item.import_order?.createdAt,
                        originalQty: Number(item.qty),
                        remainingQty: Number(item.remaining_qty),
                        consumedQty: consumed,
                        costPrice: Number(item.cost_price),
                        totalCost: costForItem
                    });
                }
            });

            const profit = totalRevenue - totalCost;

            // Create the profit cycle record
            const cycle = await ProfitCycle.create({
                start_date: startDate,
                end_date: endDate,
                revenue: totalRevenue,
                cost: totalCost,
                profit: profit,
                status: 'closed',
                revenue_details: {
                    totalOrders: ordersSummary.length,
                    items: revenueItems.sort((a, b) => b.total - a.total),
                    orders: ordersSummary
                },
                cost_details: {
                    items: costDetails.sort((a, b) => b.totalCost - a.totalCost)
                }
            });

            res.json({
                message: 'Chu kỳ lợi nhuận đã được tính toán thành công',
                cycle
            });

        } catch (error: any) {
            console.error('Profit calculation error:', error);
            res.status(500).json({ message: error.message });
        }
    }

    // Delete a cycle
    deleteCycle = async (req: Request, res: Response) => {
        try {
            const cycle = await ProfitCycle.findByPk(req.params.id);
            if (!cycle) {
                return res.status(404).json({ message: 'Không tìm thấy chu kỳ' });
            }
            await cycle.destroy();
            res.json({ message: 'Đã xóa chu kỳ' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new ProfitController();
