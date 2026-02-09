import { Request, Response } from 'express';
import unitService from '../services/UnitService.js';

export class UnitController {
    async getAll(req: Request, res: Response) {
        try {
            const units = await unitService.getAll();
            res.status(200).json(units);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const unit = await unitService.getById(Number(req.params.id));
            res.status(200).json(unit);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const unit = await unitService.create(req.body);
            res.status(201).json(unit);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const unit = await unitService.update(Number(req.params.id), req.body);
            res.status(200).json(unit);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await unitService.delete(Number(req.params.id));
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new UnitController();
