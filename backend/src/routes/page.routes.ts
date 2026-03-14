import { Router } from 'express';
import { PageController } from '../controllers/page.controller';
import { authenticate } from '../middleware';

const router = Router();

// Apply authentication middleware to all page routes
router.use(authenticate);

router.get('/', PageController.getAll);
router.get('/:id', PageController.getOne);
router.post('/', PageController.create);
router.put('/:id', PageController.update);
router.delete('/:id', PageController.delete);

export default router;
