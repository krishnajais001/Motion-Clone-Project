import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

/**
 * Decoded Supabase user metadata.
 */
export interface SupabaseJwtPayload {
    sub: string;
    email: string | undefined;
    role: string | undefined;
}


/**
 * Extend Express Request to include the authenticated user.
 */
declare global {
    namespace Express {
        interface Request {
            user?: SupabaseJwtPayload;
        }
    }
}

/**
 * Express middleware that verifies a Supabase user session using the token.
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Missing or malformed Authorization header.',
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided.',
            });
        }

        // Call Supabase to get the user - the most modern and secure method
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: error?.message || 'Invalid session.',
            });
        }

        // Attach user to request
        req.user = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (err: any) {
        console.error('Auth Middleware Exception:', err.message);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Authentication failed.',
        });
    }
};
