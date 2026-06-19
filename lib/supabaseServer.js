import { createClient } from '@supabase/supabase-js';

let _client;

function getClient() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing Supabase server environment variables.');
    _client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _client;
}

// Proxy defers client creation until first property access (route handler runtime),
// so Next.js build doesn't throw when importing this module without env vars.
const supabaseServer = new Proxy({}, {
  get(_, prop) { return getClient()[prop]; },
});

export default supabaseServer;
