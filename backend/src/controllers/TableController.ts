import { Request, Response } from 'express';
import tableService from '../services/TableService.js';

export class TableController {
    async getAll(req: Request, res: Response) {
        try {
            const tables = await tableService.getAll();
            res.status(200).json(tables);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const table = await tableService.getById(Number(req.params.id));
            res.status(200).json(table);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const table = await tableService.create(req.body);
            res.status(201).json(table);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const table = await tableService.update(Number(req.params.id), req.body);
            res.status(200).json(table);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await tableService.delete(Number(req.params.id));
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new TableController();
