import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env['SUPABASE_URL'] || '';
const supabaseSecretKey = process.env['SUPABASE_SECRET_KEY'] || '';

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function test() {
    console.log('--- Testing Pages ---');
    const pages = await supabase.from('pages').select('*').limit(1);
    console.log('Pages Error:', pages.error);
    
    console.log('--- Testing Projects ---');
    const projects = await supabase.from('projects').select('*').limit(1);
    console.log('Projects Error:', projects.error);
    
    console.log('--- Testing Events ---');
    const events = await supabase.from('events').select('*').limit(1);
    console.log('Events Error:', events.error);
    
    console.log('--- Testing Tasks ---');
    const tasks = await supabase.from('tasks').select('*').limit(1);
    console.log('Tasks Error:', tasks.error);
    
    process.exit(0);
}

test();
