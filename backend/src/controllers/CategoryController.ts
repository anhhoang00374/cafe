import { Request, Response } from 'express';
import categoryService from '../services/CategoryService.js';

export class CategoryController {
    async getAll(req: Request, res: Response) {
        try {
            const categories = await categoryService.getAll();
            res.status(200).json(categories);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const category = await categoryService.getById(Number(req.params.id));
            res.status(200).json(category);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const category = await categoryService.create(req.body);
            res.status(201).json(category);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const category = await categoryService.update(Number(req.params.id), req.body);
            res.status(200).json(category);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await categoryService.delete(Number(req.params.id));
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new CategoryController();
