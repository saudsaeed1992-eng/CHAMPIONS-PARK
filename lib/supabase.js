import { createClient } from '@supabase/supabase-js';

let _client;

function getClient() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Missing Supabase environment variables.');
    _client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return _client;
}

// Proxy defers client creation until first property access (runtime),
// so Next.js build doesn't throw when importing this module without env vars.
const supabase = new Proxy({}, {
  get(_, prop) { return getClient()[prop]; },
});

export default supabase;
