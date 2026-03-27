import { supabase } from '@/lib/supabase';

/**
 * Fetch the current authenticated user.
 */
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

/**
 * Update user profile/metadata.
 */
export const updateProfile = async (data: { full_name?: string }) => {
    const { data: { user }, error } = await supabase.auth.updateUser({
        data: data
    });
    if (error) throw error;
    return user;
};

/**
 * Update user email.
 */
export const updateEmail = async (email: string) => {
    const { data: { user }, error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
    return user;
};

/**
 * Update user password.
 */
export const updatePassword = async (password: string) => {
    const { data: { user }, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return user;
};
