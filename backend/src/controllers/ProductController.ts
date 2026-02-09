import { Request, Response } from 'express';
import productService from '../services/ProductService.js';

export class ProductController {
    async getAll(req: Request, res: Response) {
        try {
            const products = await productService.getAll();
            res.status(200).json(products);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const product = await productService.getById(Number(req.params.id));
            res.status(200).json(product);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const data = { ...req.body };
            if (req.file) {
                data.image = `/uploads/${req.file.filename}`;
            }
            const product = await productService.create(data);
            res.status(201).json(product);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const data = { ...req.body };
            if (req.file) {
                data.image = `/uploads/${req.file.filename}`;
            }
            const product = await productService.update(Number(req.params.id), data);
            res.status(200).json(product);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await productService.delete(Number(req.params.id));
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new ProductController();
