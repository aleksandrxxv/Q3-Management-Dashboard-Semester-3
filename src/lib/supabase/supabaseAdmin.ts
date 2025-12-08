import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // DO NOT expose to client

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
