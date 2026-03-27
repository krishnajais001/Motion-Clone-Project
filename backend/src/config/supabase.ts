import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env['SUPABASE_URL'] || '';
const supabaseSecretKey = process.env['SUPABASE_SECRET_KEY'] || '';

if (!supabaseUrl || !supabaseSecretKey) {
  console.warn('Backend: SUPABASE_URL or SUPABASE_SECRET_KEY is missing from environment variables.');
}

/**
 * Supabase Admin client for backend operations.
 * Uses the Secret Key to bypass RLS when necessary.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
