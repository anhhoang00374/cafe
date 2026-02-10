import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import ImportItem from '../models/ImportItem.js';
import ProfitCycle from '../models/ProfitCycle.js';
import { Op } from 'sequelize';
import { sequelize } from '../models/index.js';

export class ReportService {
    async getDashboardStats() {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Use Payment.createdAt as the payment time
        const payments = await Payment.findAll({
            where: {
                createdAt: { [Op.gte]: todayStart }
            }
        });

        const revenueToday = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const ordersTodayCount = payments.length;

        return {
            revenueToday: revenueToday || 0,
            ordersToday: ordersTodayCount,
        };
    }

    async calculateProfit() {
        const lastCycle = await ProfitCycle.findOne({
            order: [['end_date', 'DESC']]
        });

        const startDate = lastCycle ? lastCycle.end_date : new Date(0);
        const endDate = new Date();

        const revenue = await Order.sum('final_total', {
            where: {
                status: 'completed',
                updatedAt: { [Op.gt]: startDate, [Op.lte]: endDate }
            }
        }) || 0;

        // Simplified cost calculation: sum of import costs in the same period
        // In a real system, this would be based on COGS of sold items.
        const costResults = await ImportItem.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.literal('qty * cost_price')), 'total_cost']
            ],
            where: {
                createdAt: { [Op.gt]: startDate, [Op.lte]: endDate }
            },
            raw: true
        }) as any;

        const cost = Number(costResults[0]?.total_cost) || 0;

        const profit = revenue - cost;

        const newCycle = await ProfitCycle.create({
            start_date: startDate,
            end_date: endDate,
            revenue,
            cost,
            profit
        });

        return newCycle;
    }

    async getProfitHistory() {
        return ProfitCycle.findAll({ order: [['createdAt', 'DESC']] });
    }
}

export default new ReportService();
