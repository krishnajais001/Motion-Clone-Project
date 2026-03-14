import { supabase } from './supabase';

/**
 * Get the current Supabase session's access token (JWT).
 * Returns null if user is not authenticated.
 */
export async function getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
}

/**
 * Get the current authenticated user, or null if not logged in.
 */
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Sign out the current user from both Supabase and any demo session.
 */
export async function signOut() {
    localStorage.removeItem('motion-demo-session');
    await supabase.auth.signOut();
}
