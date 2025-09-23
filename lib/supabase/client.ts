// app/lib/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

// ブラウザ用クライアント
export const createClientSupabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
