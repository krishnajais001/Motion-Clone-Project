import { Request, Response } from 'express';
import { EventService } from '../services/event.service';

export class EventController {
    static async getAll(req: Request, res: Response) {
        try {
            const owner_id = req.user?.sub as string;
            const { start, end } = req.query;
            const events = await EventService.getEvents(owner_id, start as string, end as string);
            res.json(events);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const owner_id = req.user?.sub as string;
            const event = await EventService.createEvent(owner_id, req.body);
            res.status(201).json(event);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const owner_id = req.user?.sub as string;
            const id = req.params.id as string;
            const event = await EventService.updateEvent(owner_id, id, req.body);
            res.json(event);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const owner_id = req.user?.sub as string;
            const id = req.params.id as string;
            await EventService.deleteEvent(owner_id, id);
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
