
import dotenv from 'dotenv';
import * as path from 'path';

// Polyfill fetch for Jest/jsdom environment
if (typeof globalThis.fetch === 'undefined') {
  try {
    // Try to use Node's built-in fetch (Node 18+)
    const { fetch: nodeFetch } = require('undici');
    globalThis.fetch = nodeFetch;
  } catch (e) {
    try {
      // Fallback to whatwg-fetch if available
      require('whatwg-fetch');
    } catch (e2) {
      // If neither works, we'll need to install a polyfill
      console.warn('⚠️  fetch polyfill not available. Install whatwg-fetch or use Node 18+');
    }
  }
}

// Load environment variables from .env.local (Next.js default) or .env
// Try .env.local first, then .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath }); // This will override if .env exists

// Ensure NEXT_PUBLIC_ variables are available
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('⚠️  NEXT_PUBLIC_SUPABASE_URL not found. Tests may fail.');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not found. Tests may fail.');
}
