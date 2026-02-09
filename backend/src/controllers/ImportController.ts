import { Request, Response } from 'express';
import importService from '../services/ImportService.js';

export class ImportController {
    async getAll(req: Request, res: Response) {
        try {
            const imports = await importService.getAll();
            res.status(200).json(imports);
        } catch (error: any) {
            console.error('Error fetching imports:', error);
            res.status(500).json({ message: error.message, stack: error.stack });
        }
    }

    async create(req: Request, res: Response) {
        try {
            console.log('Creating import with body:', JSON.stringify(req.body, null, 2));
            const { date, supplier, items } = req.body;
            const result = await importService.createImport(new Date(date), supplier, items);
            res.status(201).json(result);
        } catch (error: any) {
            console.error('Error creating import:', error);
            res.status(400).json({ message: error.message, stack: error.stack });
        }
    }

    async updateItemStock(req: Request, res: Response) {
        try {
            const { remaining_qty, cost_price } = req.body;
            const result = await importService.updateItem(parseInt(req.params.id as string), remaining_qty, cost_price);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new ImportController();
