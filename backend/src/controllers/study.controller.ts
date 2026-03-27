import { Request, Response } from 'express';
import { StudyService } from '../services/study.service';

export class StudyController {
  static async getSubjects(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const subjects = await StudyService.getSubjects(userId);
      res.json(subjects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createSubject(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      const { name } = req.body;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const subject = await StudyService.createSubject(userId, name);
      res.status(201).json(subject);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async incrementTime(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      const { id } = req.params;
      const { duration } = req.body; // In seconds
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const updated = await StudyService.updateSubjectTime(userId, id as string, duration);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteSubject(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      const { id } = req.params;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      await StudyService.deleteSubject(userId, id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getSessions(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const sessions = await StudyService.getSessions(userId);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async logSession(req: Request, res: Response) {
    try {
      const userId = req.user?.sub;
      const { subject_name, duration } = req.body;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const session = await StudyService.logSession(userId, subject_name, duration);
      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
