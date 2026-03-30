const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function check() {
  const { data: users, error: userErr } = await supabaseAdmin.auth.admin.listUsers();
  const { data: projects, error: projErr } = await supabaseAdmin.from('projects').select('*');
  const { data: pages, error: pageErr } = await supabaseAdmin.from('pages').select('*');
  
  console.log("Users:", users.users.length);
  console.log("Projects:", projects?.length);
  console.log("Pages:", pages?.length);
}
check();
