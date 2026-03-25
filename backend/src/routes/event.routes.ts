import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticate } from '../middleware';

const router = Router();

router.use(authenticate);

router.get('/', EventController.getAll);
router.post('/', EventController.create);
router.put('/:id', EventController.update);
router.delete('/:id', EventController.delete);

export default router;
