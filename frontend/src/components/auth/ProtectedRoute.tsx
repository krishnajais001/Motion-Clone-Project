import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get the initial session
        const checkSession = async () => {
            const isDemo = localStorage.getItem('motion-demo-session') === 'true';
            const { data: { session } } = await supabase.auth.getSession();

            if (isDemo || session) {
                setSession(session || ({} as Session)); // Treat demo as session
            } else {
                setSession(null); // Ensure session is null if neither demo nor real session
            }
            setLoading(false);
        };

        checkSession();

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            // When auth state changes, we should re-evaluate the session,
            // potentially overriding a demo session if a real logout occurs.
            // Or, if a real login occurs, it should take precedence.
            const isDemo = localStorage.getItem('motion-demo-session') === 'true';
            if (isDemo && !session) {
                // If it's a demo session and no real Supabase session, keep the "demo session" state
                setSession({} as Session);
            } else {
                // Otherwise, use the actual Supabase session
                setSession(session);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
                    <p className="text-sm text-muted-foreground">Loading…</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
