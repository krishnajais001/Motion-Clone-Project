import { Request, Response } from 'express';
import { PageService } from '../services/page.service';

export class PageController {
    static async getAll(req: Request, res: Response) {
        try {
            const userId = req.user?.sub;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const pages = await PageService.getAllPages(userId);
            res.json(pages);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getOne(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.sub;
            if (!userId || !id) return res.status(401).json({ message: 'Unauthorized' });

            const page = await PageService.getPageById(id as string, userId as string);
            res.json(page);
        } catch (error: any) {
            res.status(404).json({ message: 'Page not found' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const userId = req.user?.sub;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const newPage = await PageService.createPage({
                ...req.body,
                owner_id: userId,
            });
            res.status(201).json(newPage);
        } catch (error: any) {
            console.error('Page Creation Error:', error);
            res.status(400).json({ message: error.message });
        }

    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.sub;
            if (!userId || !id) return res.status(401).json({ message: 'Unauthorized' });

            const updatedPage = await PageService.updatePage(id as string, userId as string, req.body);
            res.json(updatedPage);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.sub;
            if (!userId || !id) return res.status(401).json({ message: 'Unauthorized' });

            await PageService.deletePage(id as string, userId as string);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}
