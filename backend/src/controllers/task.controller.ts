import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

export class TaskController {
    static async getAll(req: Request, res: Response) {
        try {
            const owner_id = req.user?.sub as string;
            const { page_id } = req.query;
            const tasks = await TaskService.getTasks(owner_id, page_id as string);
            res.json(tasks);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const owner_id = req.user?.sub as string;
            const task = await TaskService.createTask(owner_id, req.body);
            res.status(201).json(task);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const owner_id = req.user?.sub as string;
            const id = req.params.id as string;
            const task = await TaskService.updateTask(owner_id, id, req.body);
            res.json(task);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const owner_id = req.user?.sub as string;
            const id = req.params.id as string;
            await TaskService.deleteTask(owner_id, id);
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
