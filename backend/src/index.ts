import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pageRoutes from './routes/page.routes';
import { authenticate } from './middleware';

dotenv.config();

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

// Register page routes
app.use('/api/pages', pageRoutes);

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

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
