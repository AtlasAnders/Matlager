// This file exists only so Hostinger's Supabase auto-connect wizard can
// detect that this app uses Supabase and inject SUPABASE_URL / SUPABASE_API_KEY
// as environment variables on deploy. The actual app (src/lib/supabase/*)
// does not import this file — it has its own typed clients.
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

// Test the connection
supabase
  .from('kategori')
  .select('*')
  .limit(1)
  .then(({ data, error }) => {
    if (error) console.error('Connection error:', error);
    else console.log('Connected:', data);
  });

module.exports = supabase;
