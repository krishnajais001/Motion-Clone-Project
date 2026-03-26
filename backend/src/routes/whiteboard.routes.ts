import { Router } from 'express';
import { WhiteboardService } from '../services/whiteboard.service';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Get all whiteboards
router.get('/', authenticate, async (req: any, res) => {
    try {
        const userId = req.user.sub;
        const whiteboards = await WhiteboardService.getAllWhiteboards(userId);
        res.json(whiteboards);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single whiteboard by ID
router.get('/:id', authenticate, async (req: any, res) => {
    try {
        const userId = req.user.sub;
        const whiteboard = await WhiteboardService.getWhiteboardById(req.params.id, userId);
        res.json(whiteboard);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
});

// Create or update (Save)
router.post('/save', authenticate, async (req: any, res) => {
    try {
        const userId = req.user.sub;
        const saved = await WhiteboardService.saveWhiteboard(userId, req.body);
        res.json(saved);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete
router.delete('/:id', authenticate, async (req: any, res) => {
    try {
        const userId = req.user.sub;
        await WhiteboardService.deleteWhiteboard(req.params.id, userId);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
