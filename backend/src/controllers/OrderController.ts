import { Request, Response } from 'express';
import orderService from '../services/OrderService.js';

export class OrderController {
    async getAllToday(req: Request, res: Response) {
        try {
            const orders = await orderService.getOrdersToday();
            res.status(200).json(orders);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const order = await orderService.create(req.body);
            res.status(201).json(order);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async addItem(req: Request, res: Response) {
        try {
            const { product_id, qty } = req.body;
            const order = await orderService.addItem(Number(req.params.id), product_id, qty);
            res.status(200).json(order);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateItemQty(req: Request, res: Response) {
        try {
            const order = await orderService.updateItemQty(Number(req.params.itemId), req.body.qty);
            res.status(200).json(order);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async completeOrder(req: Request, res: Response) {
        try {
            const body = req.body || {};
            const discount = Number(body.discount || 0);

            const order = await orderService.completeOrder(Number(req.params.id), discount);
            res.status(200).json(order);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async markServed(req: Request, res: Response) {
        try {
            await orderService.markAsServed(Number(req.params.id));
            res.status(200).json({ message: 'Order served' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async cancelOrder(req: Request, res: Response) {
        try {
            await orderService.cancelOrder(Number(req.params.id));
            res.status(200).json({ message: 'Order cancelled' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const order = await orderService.update(Number(req.params.id), req.body);
            res.status(200).json(order);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const order = await orderService.getById(Number(req.params.id));
            if (!order) return res.status(404).json({ message: 'Order not found' });
            res.status(200).json(order);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new OrderController();
