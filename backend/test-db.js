const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function check() {
  const { data: subjects, error: subErr } = await supabaseAdmin.from('study_subjects').select('*');
  const { data: sessions, error: sesErr } = await supabaseAdmin.from('study_sessions').select('*');
  
  console.log("Subjects:", JSON.stringify(subjects, null, 2));
  console.log("Subjects Err:", subErr);
  
  console.log("Sessions:", JSON.stringify(sessions, null, 2));
  console.log("Sessions Err:", sesErr);
}
check();
