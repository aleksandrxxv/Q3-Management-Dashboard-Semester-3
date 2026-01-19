import { createClient } from '@supabase/supabase-js';

// Define environment variables for security
const SUPABASE_URL_Q3 = process.env.NEXT_PUBLIC_SUPABASE_URL_Q3 || '';
const SUPABASE_ANON_KEY_Q3 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_Q3 || '';


console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Anon key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!SUPABASE_URL_Q3 || !SUPABASE_ANON_KEY_Q3) {
  throw new Error('Supabase environment variables are missing');
}

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL_Q3, SUPABASE_ANON_KEY_Q3);

const SUPABASE_URL_ENERGY = process.env.NEXT_PUBLIC_SUPABASE_URL_ENERGY || '';
const SUPABASE_ANON_KEY_ENERGY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_ENERGY || '';

// Create and export the Supabase client
export const supabaseEnergy = createClient(SUPABASE_URL_ENERGY, SUPABASE_ANON_KEY_ENERGY);