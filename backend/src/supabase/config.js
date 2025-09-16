const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Service Key is missing in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
if (!supabase) {
    console.error("Failed to create Supabase client.");
}
else {
    console.log("Supabase client created successfully.");
}

module.exports = supabase;
