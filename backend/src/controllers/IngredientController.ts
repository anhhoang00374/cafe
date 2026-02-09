import { Request, Response } from 'express';
import Ingredient from '../models/Ingredient.js';
import Unit from '../models/Unit.js';

class IngredientController {
    async getAll(req: Request, res: Response) {
        try {
            const ingredients = await Ingredient.findAll({
                include: [
                    { model: Unit, as: 'unit', attributes: ['name'] }
                ]
            });
            res.json(ingredients);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const ingredient = await Ingredient.findByPk(req.params.id as string, {
                include: [
                    { model: Unit, as: 'unit', attributes: ['name'] }
                ]
            });
            if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });
            res.json(ingredient);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { name, unit_id } = req.body;
            const image = req.file ? `/uploads/${req.file.filename}` : null;
            const ingredient = await Ingredient.create({ name, unit_id, image });
            res.status(201).json(ingredient);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { name, unit_id } = req.body;
            const updateData: any = { name, unit_id };
            if (req.file) {
                updateData.image = `/uploads/${req.file.filename}`;
            }
            const [updated] = await Ingredient.update(updateData, {
                where: { id: req.params.id as string }
            });
            if (!updated) return res.status(404).json({ message: 'Ingredient not found' });
            const ingredient = await Ingredient.findByPk(req.params.id as string);
            res.json(ingredient);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const deleted = await Ingredient.destroy({
                where: { id: req.params.id }
            });
            if (!deleted) return res.status(404).json({ message: 'Ingredient not found' });
            res.json({ message: 'Ingredient deleted' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new IngredientController();
