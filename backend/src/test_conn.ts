import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env['SUPABASE_URL'] || '';
const supabaseSecretKey = process.env['SUPABASE_SECRET_KEY'] || '';

console.log('Testing Supabase Connection for Whiteboards...');
console.log('URL:', supabaseUrl);

if (!supabaseUrl || !supabaseSecretKey) {
    console.error('❌ SUPABASE_URL or SUPABASE_SECRET_KEY is missing from environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function test() {
    try {
        const { data, error } = await supabase
            .from('whiteboards')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Supabase Error:', error);
            if (error.code === 'P0001' || error.message?.includes('relation "whiteboards" does not exist')) {
                console.log('⚠️  CRITICAL: The "whiteboards" table is missing in Supabase!');
            }
        } else {
            console.log('✅ Connection Successful! Whiteboards data:', data);
        }
    } catch (e: any) {
        console.error('❌ Exception:', e.message);
    }
}

test();
