import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await (async () => {
            // Demo Bypass
            if (email === 'admin@motion.com' && password === 'password') {
                localStorage.setItem('motion-demo-session', 'true');
                return { error: null };
            }
            return supabase.auth.signInWithPassword({ email, password });
        })();

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/app');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-sm space-y-6 px-4">
                {/* Logo / Brand */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Welcome back
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Sign in to your workspace
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label
                            htmlFor="login-email"
                            className="text-sm font-medium text-foreground"
                        >
                            Email
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="login-password"
                            className="text-sm font-medium text-foreground"
                        >
                            Password
                        </label>
                        <input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? 'Signing in…' : 'Sign in'}
                    </Button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link
                        to="/signup"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
