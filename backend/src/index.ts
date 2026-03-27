import dotenv from 'dotenv';
dotenv.config();

process.on('uncaughtException', (err) => {
    console.error('FATAL LOG: Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL LOG: Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

import express, { Request, Response } from 'express';
import cors from 'cors';
import pageRoutes from './routes/page.routes';
import taskRoutes from './routes/task.routes';
import eventRoutes from './routes/event.routes';
import whiteboardRoutes from './routes/whiteboard.routes';
import projectRoutes from './routes/project.routes';
import studyRoutes from './routes/study.routes';
import { authenticate } from './middleware';

const app = express();
const PORT = process.env['PORT'] || 3000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Public routes (no auth required)
// ---------------------------------------------------------------------------
app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Motion Backend is Running!' });
});

// ---------------------------------------------------------------------------
// Protected routes (JWT required)
// ---------------------------------------------------------------------------

// Register routes
app.use('/api/pages', pageRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/whiteboards', whiteboardRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/study', studyRoutes);

/**
 * Example protected route.
 */
app.get('/api/me', authenticate, (req: Request, res: Response) => {
    res.json({
        message: 'Authenticated!',
        user: {
            id: req.user?.sub,
            email: req.user?.email,
            role: req.user?.role,
        },
    });
});

console.log('Attempting to start server on port:', PORT);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    console.error('SERVER ERROR:', err);
});
