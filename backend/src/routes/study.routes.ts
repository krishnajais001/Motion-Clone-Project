import { Router } from 'express';
import { StudyController } from '../controllers/study.controller';
import { authenticate } from '../middleware';

const router = Router();

router.use(authenticate);

// Subjects
router.get('/subjects', StudyController.getSubjects);
router.post('/subjects', StudyController.createSubject);
router.put('/subjects/:id/increment', StudyController.incrementTime);
router.delete('/subjects/:id', StudyController.deleteSubject);

// Sessions
router.get('/sessions', StudyController.getSessions);
router.post('/sessions', StudyController.logSession);

export default router;
